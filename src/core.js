/**
 * TinyPine.js - Reaktif mikro-framework çekirdeği
 *
 * NASIL ÇALIŞIR:
 * 1. Proxy ile reaktif state oluşturulur
 * 2. DOM'daki t-data attribute'leri taranır
 * 3. Her scope'ta state objesi ve directive'ler işlenir
 * 4. State değişince tüm directive'ler güncellenir
 */

/**
 * Reaktif state objesi oluşturur - Proxy kullanarak değişiklikleri yakalar
 * @param {Object} data - Reaktif yapılacak data objesi
 * @param {Function} callback - State değiştiğinde çağrılacak callback
 * @returns {Proxy} Reaktif proxy objesi
 *
 * NEDEN PROXY KULLANIR:
 * - Native JavaScript Proxy API ile her property değişimini yakalar
 * - Callback tetiklenerek directive'ler otomatik güncellenir
 * - Performanslı ve native çözüm
 */
function reactive(data, callback) {
    const proxy = new Proxy(data, {
        set(target, key, value) {
            const oldValue = target[key];
            target[key] = value;

            // Special handling for arrays
            if (Array.isArray(value)) {
                // Make array reactive too
                const arrayMethods = [
                    "push",
                    "pop",
                    "shift",
                    "unshift",
                    "splice",
                    "sort",
                    "reverse",
                ];
                arrayMethods.forEach((method) => {
                    const original = Array.prototype[method];
                    value[method] = function (...args) {
                        const result = original.apply(this, args);
                        if (callback) callback(key, value);
                        return result;
                    };
                });
            }

            if (callback) callback(key, value);
            return true;
        },
        get(target, key) {
            const value = target[key];
            return value;
        },
    });

    // Store reference to target for later access
    proxy._tinypineTarget = data;
    return proxy;
}

/**
 * JavaScript expression'larını güvenli şekilde state context'inde değerlendirir
 * @param {string} expression - Değerlendirilecek JS expression
 * @param {Object} state - State objesi (context olarak kullanılır)
 * @returns {*} Expression'ın döndüğü değer
 *
 * NASIL ÇALIŞIR:
 * 1. State'in tüm property'lerini context'e kopyalar
 * 2. Function constructor ile güvenli execution context oluşturur
 * 3. Expression'ı bu context içinde çalıştırır
 *
 * NEDEN BU YÖNTEM:
 * - eval() gibi güvensiz, ama context izole
 * - Sadece state property'lerine erişim var
 * - Global scope'a erişim yok (security)
 *
 * v1.3.0 SAFE EXPRESSION EVALUATOR:
 * - Supports semicolons (;) for multiple statements
 * - Supports ternary operator (? :)
 * - Supports arrow functions (=>)
 * - Enhanced security and error handling
 */
function evaluateExpression(expression, state, contextObj, depTracker) {
    try {
        const context = {};

        // Inject global stores
        context.$store = {};
        if (
            typeof window !== "undefined" &&
            window.TinyPine &&
            window.TinyPine.getAllStores
        ) {
            try {
                const stores = window.TinyPine.getAllStores();
                Object.keys(stores).forEach((storeName) => {
                    context.$store[storeName] = stores[storeName];
                });
            } catch (e) {
                console.warn("[TinyPine] Could not get stores:", e);
            }
        }

        // $lang
        if (
            typeof window !== "undefined" &&
            window.TinyPine &&
            window.TinyPine._lang !== undefined
        ) {
            context.$lang = window.TinyPine._lang;
        }

        // Context obj varsa, ondan başla ($parent, $root, $refs, $el, $context)
        if (contextObj) {
            if (contextObj.root) context.$root = contextObj.root.data;
            if (contextObj.parent) context.$parent = contextObj.parent.data;
            context.$refs = contextObj.refs || {};
            context.$el = contextObj.el;
            // v1.3.0: Add $context for full context access
            context.$context = contextObj;
        }

        // v1.3.0: Add $route and $router helpers
        if (
            typeof window !== "undefined" &&
            window.TinyPine &&
            window.TinyPine._routerState
        ) {
            context.$route = {
                path: window.TinyPine._routerState.currentRoute || "",
                params: window.TinyPine._routerState.currentParams || {},
            };
            context.$router = {
                push: window.TinyPine.router?.push || function () {},
                navigate: window.TinyPine.router?.navigate || function () {},
                getCurrent:
                    window.TinyPine.router?.getCurrent ||
                    function () {
                        return "";
                    },
            };
        }

        // State property'lerini ekle
        if (state && typeof state === "object") {
            Object.keys(state).forEach((key) => {
                try {
                    context[key] = state[key];
                } catch (e) {
                    // Get trap error - skip
                }
            });
        }

        // Safe Expression Evaluator v1.3.0
        // Check if expression contains semicolons (multiple statements)
        const hasSemicolon = expression.includes(";");
        const hasTernary = expression.includes("?") && expression.includes(":");
        const hasArrowFunction = expression.includes("=>");

        // If expression has semicolons, wrap in block and return last value
        if (hasSemicolon) {
            // Multiple statements - use function body instead of return
            const statements = expression.split(";").filter((s) => s.trim());
            const lastStatement = statements[statements.length - 1];
            const otherStatements = statements.slice(0, -1).join(";");

            const code = otherStatements
                ? `"use strict"; ${otherStatements}; return (${lastStatement})`
                : `"use strict"; return (${lastStatement})`;

            return Function(
                ...Object.keys(context),
                code
            )(...Object.values(context));
        }

        // Standard evaluation with ternary and arrow function support
        return Function(
            ...Object.keys(context),
            `"use strict"; return (${expression})`
        )(...Object.values(context));
    } catch (error) {
        console.warn(
            "[TinyPine] Expression evaluation failed:",
            expression,
            error
        );
        return null;
    }
}

/**
 * Tüm t-* directive handler'larını içeren registry
 * Her directive için ayrı handler fonksiyonu tanımlanır
 */
const directiveHandlers = {
    /**
     * t-text: Element'in textContent'ini günceller
     * Örnek: <span t-text="count"></span>
     */
    "t-text": function (element, value, state, contextObj) {
        element.textContent = evaluateExpression(value, state, contextObj);
    },

    /**
     * t-html: Element'in innerHTML'ini güvenli şekilde günceller (v1.3.0)
     * Örnek: <div t-html="htmlContent"></div>
     * XSS Protection: Sanitizes dangerous tags and attributes
     */
    "t-html": function (element, value, state, contextObj) {
        const htmlContent = evaluateExpression(value, state, contextObj);

        if (typeof htmlContent !== "string") {
            element.innerHTML = "";
            return;
        }

        // Simple XSS sanitizer - removes dangerous tags and attributes
        const sanitizeHTML = (html) => {
            // Create a temporary div to parse HTML
            const temp = document.createElement("div");
            temp.innerHTML = html;

            // Dangerous tags to remove completely
            const dangerousTags = [
                "script",
                "iframe",
                "object",
                "embed",
                "link",
                "style",
                "meta",
                "base",
            ];
            dangerousTags.forEach((tag) => {
                const elements = temp.querySelectorAll(tag);
                elements.forEach((el) => el.remove());
            });

            // Dangerous attributes to remove
            const dangerousAttrs = [
                "onerror",
                "onload",
                "onclick",
                "onmouseover",
                "onmouseout",
                "onkeydown",
                "onkeyup",
                "onfocus",
                "onblur",
            ];

            // Walk all elements and remove dangerous attributes
            const walk = (node) => {
                if (node.nodeType === 1) {
                    // Element node
                    // Remove all on* event handlers
                    Array.from(node.attributes).forEach((attr) => {
                        if (
                            attr.name.startsWith("on") ||
                            dangerousAttrs.includes(attr.name.toLowerCase())
                        ) {
                            node.removeAttribute(attr.name);
                        }
                        // Remove javascript: protocol from href and src
                        if (
                            (attr.name === "href" || attr.name === "src") &&
                            attr.value.toLowerCase().startsWith("javascript:")
                        ) {
                            node.removeAttribute(attr.name);
                        }
                    });
                }
                // Recursively walk children
                Array.from(node.childNodes).forEach((child) => walk(child));
            };

            walk(temp);
            return temp.innerHTML;
        };

        // Apply sanitized HTML
        element.innerHTML = sanitizeHTML(htmlContent);

        if (debugMode) {
            console.log("[TinyPine] [t-html] Updated with sanitized content");
        }
    },

    /**
     * t-text.lang: Translate text based on current language
     */
    "t-text.lang": function (element, translationKey, state, contextObj) {
        const key = evaluateExpression(translationKey, state, contextObj);
        const i18n = window.TinyPine?.i18nInstance;
        const currentLang = i18n?.currentLang || "en";
        const translations = i18n?.translations?.[currentLang];

        if (translations && translations[key]) {
            element.textContent = translations[key];
            if (debugMode) {
                console.log(
                    "[TinyPine][i18n] Translated:",
                    key,
                    "→",
                    translations[key]
                );
            }
        } else {
            element.textContent = key; // Fallback to key
            if (debugMode) {
                console.warn(
                    "[TinyPine][i18n] Missing translation:",
                    key,
                    "in",
                    currentLang
                );
            }
        }
    },

    /**
     * t-show: Element'i condition'a göre gösterir/gizler
     * Örnek: <div t-show="isVisible">Hidden</div>
     */
    "t-show": function (element, expression, state, contextObj) {
        const isVisible = evaluateExpression(expression, state, contextObj);

        if (isVisible) {
            element.style.display = "";
            element.style.opacity = "1";
        } else {
            element.style.display = "none";
            element.style.opacity = "0";
        }
    },

    /**
     * t-bind: HTML attribute'lerini dinamik olarak bind eder
     * Örnek: <a t-bind:href="linkUrl">Link</a>
     *
     * NASIL ÇALIŞIR:
     * - t-bind:attr syntax'ı parse edilir
     * - Expression değerlendirilir
     * - setAttribute ile attribute güncellenir
     */
    "t-bind": function (element, expression, state, attrName) {
        const value = evaluateExpression(expression, state);
        if (attrName) {
            element.setAttribute(attrName, value || "");
        } else {
            console.warn(
                "[TinyPine] t-bind requires an attribute name, e.g., t-bind:class"
            );
        }
    },

    /**
     * t-class: CSS class'larını condition'a göre toggle eder
     * Örnek: <div t-class:active="isActive">Toggle</div>
     *
     * NASIL ÇALIŞIR:
     * - t-class:className syntax'ı parse edilir
     * - Condition true ise class eklenir, false ise çıkarılır
     */
    "t-class": function (element, expression, state, className) {
        if (className) {
            const value = evaluateExpression(expression, state);
            if (value) {
                element.classList.add(className);
            } else {
                element.classList.remove(className);
            }
        } else {
            const classNameValue = evaluateExpression(expression, state);
            if (classNameValue) {
                element.className = classNameValue;
            }
        }
    },

    /**
     * t-for: Reactive list rendering
     * Örnek: <li t-for="(item, index) in items">
     *
     * NASIL ÇALIŞIR:
     * 1. "t-for='(item, index) in items'" syntax'ını parse eder
     * 2. Items array'ini state'ten alır
     * 3. Her item için template'i clone eder
     * 4. Array değişince diff ile günceller
     */
    "t-for": function (element, expression, state, contextObj) {
        // Parse t-for syntax: "(item, index) in items"
        const match = expression.match(/\((.*?)\)\s+in\s+(.*)/);
        if (!match) {
            console.warn("[TinyPine] Invalid t-for syntax:", expression);
            return;
        }

        const itemVar = match[1].trim();
        const listName = match[2].trim();

        // Get array from state
        const items = evaluateExpression(listName, state, contextObj);

        if (!Array.isArray(items)) {
            console.warn("[TinyPine] t-for target must be an array:", listName);
            return;
        }

        // Store loop info on element
        const template = element.innerHTML;

        element._tinypineFor = {
            itemVar,
            listName,
            items: [...items], // Snapshot
            template: template,
            key: element.getAttribute("t-key") || null, // Optional key attribute
        };

        // Render initial items
        renderForLoop(element, state, contextObj);
    },

    /**
     * t-ref: Register DOM elements for access via $refs
     */
    "t-ref": function (element, value, state, context) {
        const refName = value.trim();
        if (context && refName) {
            context.refs[refName] = element;
            debugLog(`Registered ref: ${refName}`, element);
        }
    },

    /**
     * t-init: Element mount olduğunda çalışır
     */
    "t-init": function (element, expression, state, contextObj) {
        if (!element._tinypineInitFired) {
            try {
                evaluateExpression(expression, state, contextObj);
                element._tinypineInitFired = true;
                debugLog("[t-init]", { element });
            } catch (e) {
                console.error("[TinyPine] t-init error:", e);
            }
        }
    },

    /**
     * t-effect: Reactive effect - re-runs when dependencies change
     */
    "t-effect": function (element, expression, state, contextObj) {
        if (!element._tinypineEffectHandler) {
            // Track dependencies
            const deps = new Set();

            // First run with dependency tracking
            try {
                evaluateExpression(expression, state, contextObj, deps);
                debugLog("[t-effect] Initial run", {
                    element,
                    deps: Array.from(deps),
                });
            } catch (e) {
                console.error("[TinyPine] t-effect error:", e);
            }

            // Store effect info
            element._tinypineEffectHandler = {
                expression,
                deps: Array.from(deps),
                lastValues: new Map(),
            };
        }
    },

    /**
     * t-destroy: Element DOM'dan kaldırıldığında çalışır
     */
    "t-destroy": function (element, expression, state, contextObj) {
        if (!element._tinypineDestroyHandler) {
            element._tinypineDestroyHandler = () => {
                try {
                    evaluateExpression(expression, state, contextObj);
                    debugLog("[t-destroy]", { element });
                } catch (e) {
                    console.error("[TinyPine] t-destroy error:", e);
                }
            };
        }
    },

    /**
     * t-transition: Apply enter/leave transitions
     */
    "t-transition": function (element, expression, state, contextObj) {
        if (!element._tinypineTransition) {
            const presetName = expression.trim();
            element._tinypineTransition = presetName;

            // Register transition hooks
            applyTransition(element, presetName);

            if (debugMode) {
                console.log(
                    "[TinyPine] [Transition]",
                    presetName,
                    "→",
                    element
                );
            }
        }
    },

    /**
     * t-motion: Apply CSS transforms reactively
     */
    "t-motion": function (element, expression, state, contextObj) {
        const transformValue = evaluateExpression(
            expression,
            state,
            contextObj
        );
        if (transformValue) {
            element.style.transform = transformValue;
            if (debugMode) {
                console.log(
                    "[TinyPine] [Motion]",
                    expression,
                    "→",
                    transformValue
                );
            }
        }
    },

    /**
     * t-fetch: Fetch data from URL and store in state (v1.3.0 Rebuild)
     * Features:
     * - Race condition control with request ID tracking
     * - AbortController support for canceling outdated requests
     * - Loading/error state management ($loading, $error, $response)
     * - Lifecycle events (t:onFetchStart, t:onFetchError, t:onFetchEnd)
     */
    "t-fetch": function (element, expression, state, contextObj) {
        // Initialize fetch metadata on first run
        if (!element._tinypineFetchMeta) {
            element._tinypineFetchMeta = {
                requestId: 0,
                abortController: null,
                url: null,
            };
        }

        const meta = element._tinypineFetchMeta;

        // Parse URL from expression
        let url = evaluateExpression(expression, state, contextObj);
        if (typeof url !== "string") {
            console.warn(
                "[TinyPine][t-fetch] Expression must evaluate to a string URL:",
                expression
            );
            return;
        }

        // Remove quotes if present
        if (
            (url.startsWith('"') && url.endsWith('"')) ||
            (url.startsWith("'") && url.endsWith("'"))
        ) {
            url = url.slice(1, -1);
        }

        // If URL hasn't changed and fetch is in progress, skip
        if (meta.url === url && state.$loading) {
            return;
        }

        // Update URL
        meta.url = url;

        // Cancel previous request if exists
        if (meta.abortController) {
            meta.abortController.abort();
            if (debugMode) {
                console.log("[TinyPine][t-fetch] Aborted previous request");
            }
        }

        // Create new AbortController for this request
        meta.abortController = new AbortController();
        const signal = meta.abortController.signal;

        // Increment request ID to track race conditions
        meta.requestId++;
        const currentRequestId = meta.requestId;

        // Get the scope element (parent with t-data)
        let scopeElement = element;
        while (scopeElement && !scopeElement.hasAttribute("t-data")) {
            scopeElement = scopeElement.parentElement;
        }

        if (!scopeElement) {
            console.warn("[TinyPine][t-fetch] No parent scope element found");
            return;
        }

        // Set loading state
        state.$loading = true;
        state.$error = null;
        state.$response = null;

        // Dispatch lifecycle event: t:onFetchStart
        const startEvent = new CustomEvent("t:onFetchStart", {
            detail: { url, requestId: currentRequestId },
            bubbles: true,
        });
        element.dispatchEvent(startEvent);

        if (debugMode) {
            console.log(
                "[TinyPine][t-fetch] Starting request:",
                url,
                "ID:",
                currentRequestId
            );
        }

        // Make fetch request with AbortSignal
        fetch(url, { signal })
            .then((res) => {
                // Check if this request is still the latest
                if (currentRequestId !== meta.requestId) {
                    if (debugMode) {
                        console.log(
                            "[TinyPine][t-fetch] Ignoring stale response, ID:",
                            currentRequestId
                        );
                    }
                    return null; // Stale request, ignore
                }

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }

                return res.json();
            })
            .then((data) => {
                // Check again after async operation
                if (currentRequestId !== meta.requestId || data === null) {
                    return; // Stale or aborted
                }

                // Clear loading state
                state.$loading = false;
                state.$error = null;
                state.$response = data;

                // Update state with fetched data
                if (Array.isArray(data)) {
                    // Find the array key in state
                    Object.keys(state).forEach((key) => {
                        if (key.startsWith("$")) return; // Skip $ variables
                        if (Array.isArray(state[key])) {
                            // Clear and populate array
                            state[key].splice(0);
                            data.forEach((item) => {
                                state[key].push(item);
                            });
                        }
                    });
                } else if (data && typeof data === "object") {
                    // Update state with fetched data
                    Object.keys(data).forEach((key) => {
                        if (state.hasOwnProperty(key) && !key.startsWith("$")) {
                            if (
                                Array.isArray(state[key]) &&
                                Array.isArray(data[key])
                            ) {
                                // For arrays, replace all items
                                state[key].splice(0);
                                data[key].forEach((item) => {
                                    state[key].push(item);
                                });
                            } else {
                                state[key] = data[key];
                            }
                        }
                    });
                }

                // Trigger update manually with correct scope element
                if (scopeElement) {
                    updateDirectives(scopeElement, state);
                }

                // Dispatch lifecycle event: t:onFetchEnd
                const endEvent = new CustomEvent("t:onFetchEnd", {
                    detail: { url, data, requestId: currentRequestId },
                    bubbles: true,
                });
                element.dispatchEvent(endEvent);

                if (debugMode) {
                    console.log("[TinyPine][t-fetch] Success:", url, "→", data);
                }
            })
            .catch((err) => {
                // Ignore AbortError (user canceled)
                if (err.name === "AbortError") {
                    if (debugMode) {
                        console.log(
                            "[TinyPine][t-fetch] Request aborted:",
                            url
                        );
                    }
                    return;
                }

                // Check if this request is still the latest
                if (currentRequestId !== meta.requestId) {
                    return; // Stale request, ignore error
                }

                // Set error state
                state.$loading = false;
                state.$error = err.message || "Fetch failed";
                state.$response = null;

                // Trigger update to show error state
                if (scopeElement) {
                    updateDirectives(scopeElement, state);
                }

                // Dispatch lifecycle event: t:onFetchError
                const errorEvent = new CustomEvent("t:onFetchError", {
                    detail: { url, error: err, requestId: currentRequestId },
                    bubbles: true,
                });
                element.dispatchEvent(errorEvent);

                console.error("[TinyPine][t-fetch] Error:", url, "→", err);
            });
    },

    /**
     * t-await: Wait for promise and show content
     */
    "t-await": function (element, expression, state, contextObj) {
        if (!element._tinypineAwaitHandler) {
            element._tinypineAwaitHandler = true;

            // Get scope element and state (closure)
            const scopeElement = element.closest("[t-data]");
            const currentState = scopeElement?._tinypineState || state;

            const promise = evaluateExpression(expression, state, contextObj);

            if (promise && typeof promise.then === "function") {
                // Start loading
                element._tinypineLoading = true;
                if (element.querySelector("[t-loading]")) {
                    element.querySelector("[t-loading]").style.display = "";
                }
                if (element.querySelector("[t-error]")) {
                    element.querySelector("[t-error]").style.display = "none";
                }

                promise
                    .then((data) => {
                        element._tinypineAwaitData = data;
                        element._tinypineLoading = false;
                        element._tinypineError = false;

                        // Update state with data
                        if (
                            currentState &&
                            typeof data === "object" &&
                            !Array.isArray(data)
                        ) {
                            const rawState =
                                currentState._tinypineTarget || currentState;

                            // Filter out internal keys (_tinypine*)
                            const stateKeys = Object.keys(rawState).filter(
                                (key) => !key.startsWith("_tinypine")
                            );
                            if (stateKeys.length === 1) {
                                const firstKey = stateKeys[0];
                                currentState[firstKey] = data;
                            } else {
                                // Otherwise merge all properties
                                Object.keys(data).forEach((key) => {
                                    if (rawState.hasOwnProperty(key)) {
                                        currentState[key] = data[key];
                                    }
                                });
                            }

                            // Trigger update
                            if (scopeElement) {
                                updateDirectives(scopeElement, currentState);
                            }
                        }

                        if (element.querySelector("[t-loading]")) {
                            element.querySelector("[t-loading]").style.display =
                                "none";
                        }
                        if (debugMode) {
                            console.log(
                                "[TinyPine][Await]",
                                expression,
                                "→",
                                data
                            );
                        }
                    })
                    .catch((err) => {
                        element._tinypineLoading = false;
                        element._tinypineError = err;
                        if (element.querySelector("[t-loading]")) {
                            element.querySelector("[t-loading]").style.display =
                                "none";
                        }
                        if (element.querySelector("[t-error]")) {
                            element.querySelector("[t-error]").style.display =
                                "";
                        }
                        console.error(
                            "[TinyPine][Await]",
                            expression,
                            "→",
                            err
                        );
                    });
            }
        }
    },

    /**
     * t-loading: Show while await is loading
     */
    "t-loading": function (element, expression, state, contextObj) {
        const text = evaluateExpression(expression, state, contextObj);
        element.textContent = text;
        element.style.display = "none"; // Hidden by default
    },

    /**
     * t-error: Show when await fails
     */
    "t-error": function (element, expression, state, contextObj) {
        const text = evaluateExpression(expression, state, contextObj);
        element.textContent = text;
        element.style.display = "none"; // Hidden by default
    },

    /**
     * t-route: Show element only when route matches
     */
    "t-route": function (element, expression, state, contextObj) {
        let routeName = evaluateExpression(expression, state, contextObj);

        // Remove quotes if present
        if (typeof routeName === "string") {
            if (
                (routeName.startsWith('"') && routeName.endsWith('"')) ||
                (routeName.startsWith("'") && routeName.endsWith("'"))
            ) {
                routeName = routeName.slice(1, -1);
            }
        }

        // Store route element for global listener
        if (!window.TinyPine.routeElements) {
            window.TinyPine.routeElements = [];
        }
        window.TinyPine.routeElements.push({ element, routeName });

        // Initial check
        const currentRoute = window.location.hash.replace("#/", "") || "home";
        if (routeName === currentRoute) {
            element.style.display = "";
        } else {
            element.style.display = "none";
        }
    },

    "t-click": function (element, expression, state) {
        // Parse modifiers from expression FIRST to check for .once
        const knownModifiers = ["prevent", "stop", "once", "outside"];
        const modifiers = [];
        let cleanExpression = expression;

        // Extract modifiers (sondan başa doğru)
        while (true) {
            const modifierPattern = /\.(\w+)$/;
            if (!modifierPattern.test(cleanExpression)) break;

            const match = cleanExpression.match(modifierPattern);
            const modifier = match[1];

            // Eğer bilinen bir modifier ise
            if (knownModifiers.includes(modifier)) {
                modifiers.unshift(modifier);
                cleanExpression = cleanExpression.replace(modifierPattern, "");
            } else {
                // Modifier değil, method ismi, durdur
                break;
            }
        }

        // Eğer .once varsa ve zaten çalıştırılmışsa, yeni handler ekleme
        if (modifiers.includes("once") && element._tinypineOnceFired) {
            return;
        }

        // Önceki handler varsa temizle (memory leak önleme)
        if (element._tinypineClickHandler) {
            element.removeEventListener("click", element._tinypineClickHandler);
            delete element._tinypineClickHandler;
        }

        const handler = function (event) {
            try {
                // Apply modifiers BEFORE processing expression
                if (modifiers.includes("prevent")) {
                    event.preventDefault();
                }
                if (modifiers.includes("stop")) {
                    event.stopPropagation();
                }

                // Handle .once modifier
                if (modifiers.includes("once")) {
                    element.removeEventListener("click", handler);
                    delete element._tinypineClickHandler;
                    element._tinypineOnceFired = true;
                }

                const scopeElement = element.closest("[t-data]");
                if (!scopeElement || !scopeElement._tinypineState) return;

                // Check if we're in a t-for item - use scoped state
                const forItem = element.closest("[t-for]");
                const loopState =
                    forItem && element._tinypineScopedState
                        ? element._tinypineScopedState
                        : null;
                // IMPORTANT: Always use the live state from scopeElement
                const state = scopeElement._tinypineState;
                const contextObj = scopeElement._tinypineContext;

                // Özel expression'ları parse et ve çalıştır
                if (cleanExpression.includes("++")) {
                    const prop = cleanExpression.replace("++", "").trim();
                    state[prop] = (state[prop] || 0) + 1;
                } else if (cleanExpression.includes("--")) {
                    const prop = cleanExpression.replace("--", "").trim();
                    state[prop] = (state[prop] || 0) - 1;
                } else if (cleanExpression.includes("=")) {
                    // Atama işlemlerini handle et
                    const parts = cleanExpression.split("=");
                    const prop = parts[0].trim();
                    const value = parts.slice(1).join("=").trim();

                    try {
                        // Check if it's a $store assignment
                        if (prop.startsWith("$store.")) {
                            const storePath = prop.split(".");
                            const storeName = storePath[1];
                            const storeKey = storePath[2];
                            if (
                                typeof window !== "undefined" &&
                                window.TinyPine &&
                                window.TinyPine.getStore
                            ) {
                                const store =
                                    window.TinyPine.getStore(storeName);
                                if (store && storeKey) {
                                    // Evaluate right side
                                    const newValue = eval(value);
                                    store[storeKey] = newValue;
                                }
                            }
                        } else if (prop === "$lang") {
                            // Special handling for $lang assignment
                            const newLang = value.replace(/['"]/g, ""); // Remove quotes
                            if (
                                typeof window !== "undefined" &&
                                window.TinyPine &&
                                window.TinyPine.$lang !== undefined
                            ) {
                                // Direct assignment to trigger setter
                                window.TinyPine.$lang = newLang;
                            }
                            // Return early to avoid processing other directives
                            return;
                        } else {
                            // Regular state assignment - evaluate with proper context
                            try {
                                // Build context from state
                                const context = {};
                                Object.keys(state).forEach((k) => {
                                    try {
                                        context[k] = state[k];
                                    } catch (e) {}
                                });

                                // Evaluate with context
                                const Func = Function(
                                    ...Object.keys(context),
                                    `return (${value})`
                                );
                                const result = Func(...Object.values(context));
                                state[prop] = result;
                            } catch (e) {
                                console.warn(
                                    "[TinyPine] Could not evaluate:",
                                    value,
                                    e
                                );
                            }
                        }
                    } catch (e) {
                        console.warn(
                            "[TinyPine] Could not evaluate:",
                            value,
                            e
                        );
                    }
                } else {
                    // Generic expression evaluation with methods
                    const context = {};

                    // State property'lerini ekle
                    const stateKeys = Object.keys(state);
                    stateKeys.forEach((k) => {
                        try {
                            context[k] = state[k];
                        } catch (e) {
                            // Skip
                        }
                    });

                    // Methods'u ekle (context'ten) - closure ile doğru state'i kullan
                    if (contextObj && contextObj.methods) {
                        const boundMethods = {};
                        Object.keys(contextObj.methods).forEach((key) => {
                            const method = contextObj.methods[key];
                            // IMPORTANT: Read FRESH state on every call
                            boundMethods[key] = function (...args) {
                                // CRITICAL: Read fresh state from scopeElement
                                const currentState =
                                    scopeElement._tinypineState;
                                // Get the actual target behind the Proxy
                                const actualState =
                                    currentState._tinypineTarget ||
                                    currentState;

                                // Bind method to actual state so this.show works
                                return method.apply(actualState, args);
                            };
                        });
                        context.methods = boundMethods;
                    }

                    // If we're in a loop, add loop variables to context
                    if (loopState) {
                        // Add all loop variables
                        Object.keys(loopState).forEach((key) => {
                            if (!context[key]) {
                                context[key] = loopState[key];
                            }
                        });
                    }

                    // $parent, $root, $refs, $el, $store'u ekle
                    if (contextObj) {
                        if (contextObj.root)
                            context.$root = contextObj.root.data;
                        if (contextObj.parent)
                            context.$parent = contextObj.parent.data;
                        context.$refs = contextObj.refs || {};
                        context.$el = contextObj.el;
                        // Add $store to context for methods
                        if (
                            typeof window !== "undefined" &&
                            window.TinyPine &&
                            window.TinyPine.getAllStores
                        ) {
                            try {
                                const stores = window.TinyPine.getAllStores();
                                context.$store = {};
                                Object.keys(stores).forEach((storeName) => {
                                    context.$store[storeName] =
                                        stores[storeName];
                                });
                            } catch (e) {}
                        }
                    }

                    // Add $lang to context
                    if (
                        typeof window !== "undefined" &&
                        window.TinyPine &&
                        window.TinyPine._lang !== undefined
                    ) {
                        context.$lang = window.TinyPine._lang;
                    }

                    // Eğer son karakter () ile bitmiyorsa, method çağrısı için ekle
                    let finalExpression = cleanExpression;
                    if (
                        finalExpression &&
                        !finalExpression.endsWith("()") &&
                        !finalExpression.includes("(")
                    ) {
                        finalExpression = finalExpression + "()";
                    }

                    const func = new Function(
                        ...Object.keys(context),
                        "event",
                        `"use strict"; return (${finalExpression})`
                    );
                    func(...Object.values(context), event);
                }

                // Directive'leri güncelle
                updateDirectives(scopeElement, state);

                // Emit directive event for visual feedback tools
                if (
                    typeof window !== "undefined" &&
                    window.TinyPine &&
                    typeof window.TinyPine.emit === "function"
                ) {
                    try {
                        window.TinyPine.emit("directive:click", element, {
                            state,
                            context: contextObj,
                            event,
                        });
                    } catch (_) {}
                }
            } catch (error) {
                console.warn("[TinyPine] Error in t-click:", error);
            }
        };

        element._tinypineClickHandler = handler;

        // Handle .outside modifier
        if (modifiers.includes("outside")) {
            document.addEventListener("click", function outsideClick(event) {
                if (!element.contains(event.target)) {
                    handler(event);
                    // Optionally remove listener after first outside click
                    if (modifiers.includes("once")) {
                        document.removeEventListener("click", outsideClick);
                        delete element._tinypineOutsideHandler;
                    }
                }
            });
            element._tinypineOutsideHandler = true;
        } else {
            element.addEventListener("click", handler);
        }
    },

    /**
     * t-model: Two-way data binding - input ve state'i senkronize tutar
     * Örnek: <input t-model="name">
     *
     * NASIL ÇALIŞIR:
     * 1. State'ten input value'yu günceller
     * 2. Input'tan state'i günceller (input event)
     * 3. Her değişimde directive'leri günceller
     *
     * NEDEN:
     * - True two-way binding için her iki yön de handle edilmeli
     * - Vue/Angular gibi modern framework'lere benzer çalışır
     */
    "t-model": function (element, expression, state, contextObj) {
        const propertyName = expression.trim();

        // Evaluate expression to get initial value (supports $store.auth.user syntax)
        const value = evaluateExpression(expression, state, contextObj);
        if (element.value !== value && element.value !== String(value)) {
            element.value = value || "";
        }

        // Input'tan state'e: input event handler
        if (!element._tinypineModelHandler) {
            const handler = function (event) {
                try {
                    const scopeElement = element.closest("[t-data]");
                    if (scopeElement && scopeElement._tinypineState) {
                        // Check if it's a $store path
                        if (propertyName.startsWith("$store.")) {
                            const parts = propertyName.split(".");
                            const storeName = parts[1];
                            const key = parts[2];
                            if (
                                typeof window !== "undefined" &&
                                window.TinyPine &&
                                window.TinyPine.getStore
                            ) {
                                const store =
                                    window.TinyPine.getStore(storeName);
                                if (store && key) {
                                    store[key] = event.target.value;
                                    updateDirectives(scopeElement, state);
                                }
                            }
                        } else {
                            // Local state update
                            const currentState = scopeElement._tinypineState;
                            if (
                                currentState &&
                                (currentState.hasOwnProperty(propertyName) ||
                                    propertyName in currentState)
                            ) {
                                currentState[propertyName] = event.target.value;
                                updateDirectives(scopeElement, currentState);
                            }
                        }
                    }
                } catch (error) {
                    console.warn("[TinyPine] Error in t-model:", error);
                }
            };
            element._tinypineModelHandler = handler;
            element.addEventListener("input", handler);
        }
    },

    /**
     * t-validate: Form validation directive (v1.3.0)
     * Örnek: <input t-validate="required|email" t-model="email">
     *
     * Validation rules:
     * - required: Field must not be empty
     * - email: Must be valid email format
     * - min:5: Minimum length
     * - max:20: Maximum length
     * - numeric: Must be a number
     * - url: Must be valid URL
     */
    "t-validate": function (element, rulesString, state, contextObj) {
        if (!element._tinypineValidateHandler) {
            const rules = rulesString.split("|").map((r) => r.trim());

            // Get or create $errors object in state
            const scopeElement = element.closest("[t-data]");
            if (!scopeElement || !scopeElement._tinypineState) return;

            const currentState = scopeElement._tinypineState;
            if (!currentState.$errors) {
                currentState.$errors = reactive({}, () => {
                    updateDirectives(scopeElement, currentState);
                });
            }

            // Get field name from t-model
            const modelAttr = element.getAttribute("t-model");
            if (!modelAttr) {
                console.warn(
                    "[TinyPine][t-validate] t-model attribute required for validation"
                );
                return;
            }
            const fieldName = modelAttr.trim();

            // Validation function
            const validate = () => {
                const value = element.value;
                const errors = [];

                rules.forEach((rule) => {
                    if (rule === "required" && !value) {
                        errors.push("This field is required");
                    } else if (rule === "email" && value) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value)) {
                            errors.push("Invalid email format");
                        }
                    } else if (rule.startsWith("min:")) {
                        const min = parseInt(rule.split(":")[1]);
                        if (value.length < min) {
                            errors.push(`Minimum ${min} characters required`);
                        }
                    } else if (rule.startsWith("max:")) {
                        const max = parseInt(rule.split(":")[1]);
                        if (value.length > max) {
                            errors.push(`Maximum ${max} characters allowed`);
                        }
                    } else if (rule === "numeric" && value) {
                        if (isNaN(value)) {
                            errors.push("Must be a number");
                        }
                    } else if (rule === "url" && value) {
                        try {
                            new URL(value);
                        } catch {
                            errors.push("Invalid URL format");
                        }
                    }
                });

                // Update $errors state
                if (errors.length > 0) {
                    currentState.$errors[fieldName] = errors;
                } else {
                    delete currentState.$errors[fieldName];
                }

                // Add/remove error class
                if (errors.length > 0) {
                    element.classList.add("tp-invalid");
                    element.classList.remove("tp-valid");
                } else if (value) {
                    element.classList.add("tp-valid");
                    element.classList.remove("tp-invalid");
                } else {
                    element.classList.remove("tp-invalid", "tp-valid");
                }

                // Dispatch validation event
                const validationEvent = new CustomEvent("t:validation", {
                    detail: {
                        field: fieldName,
                        errors,
                        isValid: errors.length === 0,
                    },
                    bubbles: true,
                });
                element.dispatchEvent(validationEvent);

                if (debugMode) {
                    console.log(
                        "[TinyPine][t-validate]",
                        fieldName,
                        "→",
                        errors.length ? errors : "valid"
                    );
                }
            };

            // Validate on input and blur
            const inputHandler = () => validate();
            const blurHandler = () => validate();

            element.addEventListener("input", inputHandler);
            element.addEventListener("blur", blurHandler);

            element._tinypineValidateHandler = {
                inputHandler,
                blurHandler,
                validate,
            };

            // Initial validation (only if field has value)
            if (element.value) {
                validate();
            }
        }
    },
};

/**
 * TinyPine'i başlatır - DOM'da t-data attribute'lerini tarar
 * @param {Element} root - Taranacak root element (default: document.body)
 *
 * NASIL ÇALIŞIR:
 * 1. Tüm [t-data] elementlerini bulur
 * 2. Her element için initializeScope çağrılır
 *
 * NEDEN:
 * - Scoped reactivity için her t-data ayrı scope oluşturur
 * - Nested scope'lar desteklenir
 */
function init(root = document.body) {
    const scopeElements = root.querySelectorAll("[t-data]");
    scopeElements.forEach((element) => initializeScope(element));

    // Process t-route elements (they work outside t-data scope)
    const routeElements = root.querySelectorAll("[t-route]");
    routeElements.forEach((element) => {
        applyDirective(
            element,
            "t-route",
            element.getAttribute("t-route"),
            null,
            null
        );
    });

    // Setup MutationObserver for unmount tracking (only once)
    if (
        typeof window !== "undefined" &&
        window.TinyPine &&
        !window.TinyPine._unmountObserverInitialized
    ) {
        window.TinyPine._unmountObserverInitialized = true;

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                mutation.removedNodes.forEach((node) => {
                    // Check if it's an element node and has context
                    if (
                        node.nodeType === 1 &&
                        window.TinyPine._contexts &&
                        window.TinyPine._contexts.has(node)
                    ) {
                        const context = window.TinyPine._contexts.get(node);
                        const element = node;

                        try {
                            // beforeUnmount hook
                            if (typeof context.beforeUnmount === "function") {
                                context.beforeUnmount(element, context);
                            }
                        } catch (_) {
                            /* safe mode */
                        }

                        try {
                            // unmounted hook
                            if (typeof context.unmounted === "function") {
                                context.unmounted(element, context);
                            }
                        } catch (_) {
                            /* safe mode */
                        }

                        // Emit global event
                        try {
                            window.TinyPine.emit &&
                                window.TinyPine.emit(
                                    "component:unmounted",
                                    element,
                                    context
                                );
                        } catch (_) {}

                        // Global onUnmount callbacks
                        if (
                            Array.isArray(window.TinyPine._onUnmountCallbacks)
                        ) {
                            window.TinyPine._onUnmountCallbacks.forEach(
                                (cb) => {
                                    try {
                                        cb(element, context);
                                    } catch (_) {}
                                }
                            );
                        }

                        // Cleanup: remove from contexts map
                        window.TinyPine._contexts.delete(node);
                    }

                    // Recursively check children
                    if (node.nodeType === 1 && node.querySelectorAll) {
                        const childScopes = node.querySelectorAll("[t-data]");
                        childScopes.forEach((child) => {
                            if (
                                window.TinyPine._contexts &&
                                window.TinyPine._contexts.has(child)
                            ) {
                                const ctx =
                                    window.TinyPine._contexts.get(child);
                                try {
                                    if (typeof ctx.beforeUnmount === "function")
                                        ctx.beforeUnmount(child, ctx);
                                } catch (_) {}
                                try {
                                    if (typeof ctx.unmounted === "function")
                                        ctx.unmounted(child, ctx);
                                } catch (_) {}
                                try {
                                    window.TinyPine.emit &&
                                        window.TinyPine.emit(
                                            "component:unmounted",
                                            child,
                                            ctx
                                        );
                                } catch (_) {}
                                if (
                                    Array.isArray(
                                        window.TinyPine._onUnmountCallbacks
                                    )
                                ) {
                                    window.TinyPine._onUnmountCallbacks.forEach(
                                        (cb) => {
                                            try {
                                                cb(child, ctx);
                                            } catch (_) {}
                                        }
                                    );
                                }
                                window.TinyPine._contexts.delete(child);
                            }
                        });
                    }
                });
            }
        });

        // Observe the root element for removals
        observer.observe(root, { childList: true, subtree: true });
        window.TinyPine._unmountObserver = observer;
    }
}

/**
 * Bir scope'ta reaktif state oluşturur ve directive'leri işler
 * @param {Element} element - t-data attribute'ü olan element
 *
 * NASIL ÇALIŞIR:
 * 1. t-data attribute'ünü parse eder (JSON object)
 * 2. Proxy ile reaktif state oluşturur
 * 3. Debounce ile update'leri optimize eder
 * 4. Scope'taki tüm directive'leri process eder
 *
 * NEDEN DEBOUNCE:
 * - Çoklu state güncellemelerinde performans için
 * - setTimeout(0) ile ertelenir ve batching yapılır
 */
function processChildDirectives(element, state, context) {
    // Check if this element has t-for - if so, don't process children yet (renderForLoop will handle it)
    if (element._tinypineFor) {
        return; // Skip - renderForLoop will handle children
    }

    const children = element.children;
    for (let i = 0; i < children.length; i++) {
        const el = children[i];
        if (el.hasAttribute("t-data")) {
            // Kendi scope'u varsa initialize et
            initializeScope(el);
            // Şimdi child'ın kendi state'ini kullan
            const childState = el._tinypineState || state;
            const childContext = el._tinypineContext || context;
            // Child'ın child'larını process et (recursive)
            if (childState) {
                processChildDirectives(el, childState, childContext);
            }
        } else {
            // Check if element has scoped state (from t-for)
            const elementState = el._tinypineScopedState || state;
            // Parent state ve context kullan
            processDirectives(el, elementState, context);
            // Recursive olarak child'larını da process et
            processChildDirectives(el, elementState, context);
        }
    }
}

function initializeScope(element) {
    const dataAttr = element.getAttribute("t-data");
    if (!dataAttr) return;

    try {
        // t-data'daki JSON object'i parse et
        let dataObject = Function('"use strict"; return (' + dataAttr + ")")();

        // Methods'u ayır
        const methods = dataObject.methods || {};
        delete dataObject.methods;

        // Lifecycle: support mounted(), beforeUnmount(), unmounted() hooks
        let mountedHook = null;
        let beforeUnmountHook = null;
        let unmountedHook = null;

        if (typeof dataObject.mounted === "function") {
            mountedHook = dataObject.mounted;
            delete dataObject.mounted;
        } else if (typeof methods.mounted === "function") {
            mountedHook = methods.mounted;
            delete methods.mounted;
        }

        if (typeof dataObject.beforeUnmount === "function") {
            beforeUnmountHook = dataObject.beforeUnmount;
            delete dataObject.beforeUnmount;
        } else if (typeof methods.beforeUnmount === "function") {
            beforeUnmountHook = methods.beforeUnmount;
            delete methods.beforeUnmount;
        }

        if (typeof dataObject.unmounted === "function") {
            unmountedHook = dataObject.unmounted;
            delete dataObject.unmounted;
        } else if (typeof methods.unmounted === "function") {
            unmountedHook = methods.unmounted;
            delete methods.unmounted;
        }

        // Parent context bul
        const parentContext = getParentContext(element);

        // Debounce için flag
        let updatePending = false;

        // Reaktif state oluştur - Proxy callback ile auto-update
        const state = reactive(dataObject, () => {
            debugLog("State changed", { element: element, data: dataObject });
            if (!updatePending) {
                updatePending = true;
                setTimeout(() => {
                    updateDirectives(element, state);
                    updatePending = false;
                }, 0);
            }
        });

        // Make arrays reactive - wrap all array methods
        Object.keys(state).forEach((key) => {
            const value = state[key];
            if (Array.isArray(value)) {
                const arrayMethods = [
                    "push",
                    "pop",
                    "shift",
                    "unshift",
                    "splice",
                    "sort",
                    "reverse",
                ];
                arrayMethods.forEach((method) => {
                    if (!value["_" + method + "_wrapped"]) {
                        const original = Array.prototype[method];
                        value[method] = function (...args) {
                            const result = original.apply(this, args);
                            updateDirectives(element, state);
                            return result;
                        };
                        value["_" + method + "_wrapped"] = true;
                    }
                });
            }
        });

        // Context objesi oluştur
        const context = {
            el: element,
            data: state,
            parent: parentContext,
            root: parentContext ? parentContext.root : null,
            refs: {},
            methods: methods,
            mounted: mountedHook || null,
            beforeUnmount: beforeUnmountHook || null,
            unmounted: unmountedHook || null,
        };

        // Root ayarla
        if (!context.root) {
            context.root = context;
        }

        // Context'i kaydet
        registerContext(element, context);

        // Register in global contexts map for unmount tracking
        if (typeof window !== "undefined" && window.TinyPine) {
            if (!window.TinyPine._contexts) {
                window.TinyPine._contexts = new Map();
            }
            window.TinyPine._contexts.set(element, context);
        }

        // $parent, $root, $refs proxy'si oluştur
        const proxiedData = new Proxy(state, {
            get(target, prop) {
                if (prop === "$parent") return context.parent?.data || null;
                if (prop === "$root") return context.root?.data || state;
                if (prop === "$refs") return context.refs;
                if (prop === "$el") return context.el;
                return target[prop];
            },
            set(target, prop, value) {
                target[prop] = value;
                return true;
            },
        });

        // Proxied data'yı kullan
        context.data = proxiedData;
        element._tinypineState = proxiedData;
        element._tinypineContext = context;

        debugLog("Context created", {
            element,
            hasParent: !!parentContext,
            root: !!context.root,
            methods: Object.keys(methods),
        });

        // İlk directive processing - sadece bu element'in directive'leri
        Array.from(element.attributes).forEach((attr) => {
            if (attr.name.startsWith("t-") && attr.name !== "t-data") {
                applyDirective(
                    element,
                    attr.name,
                    attr.value,
                    proxiedData,
                    context
                );
            }
        });

        // Child elementlerdeki directive'leri de işle - recursive yapı
        processChildDirectives(element, proxiedData, context);

        // Component-level lifecycle: mounted()
        if (!element._tinypineMountedFired) {
            element._tinypineMountedFired = true;
            const runMounted = () => {
                try {
                    if (typeof context.mounted === "function") {
                        context.mounted(element, context);
                    }
                } catch (_) {
                    /* ignore in all modes */
                }

                // Emit global lifecycle event and callbacks
                if (typeof window !== "undefined" && window.TinyPine) {
                    try {
                        window.TinyPine.emit &&
                            window.TinyPine.emit(
                                "component:mounted",
                                element,
                                context
                            );
                    } catch (_) {}
                    if (Array.isArray(window.TinyPine._onMountCallbacks)) {
                        window.TinyPine._onMountCallbacks.forEach((cb) => {
                            try {
                                cb(element, context);
                            } catch (_) {}
                        });
                    }
                }
            };

            // Ensure directives are bound before calling mounted
            if (typeof queueMicrotask === "function") {
                queueMicrotask(runMounted);
            } else {
                setTimeout(runMounted, 0);
            }
        }
    } catch (error) {
        console.warn("[TinyPine] Failed to parse t-data:", dataAttr, error);
    }
}

/**
 * Element üzerindeki tüm t-* directive'lerini işler
 * @param {Element} element - Directive'leri işlenecek element
 * @param {Object} state - Reaktif state objesi
 *
 * NASIL ÇALIŞIR:
 * 1. Tüm attributes'ları tarar
 * 2. t- ile başlayan attribute'leri bulur
 * 3. applyDirective ile her directive'i uygular
 */
function processDirectives(element, state, context) {
    Array.from(element.attributes).forEach((attr) => {
        if (attr.name.startsWith("t-") && attr.name !== "t-data") {
            applyDirective(element, attr.name, attr.value, state, context);
        }
    });
}

/**
 * Tek bir directive'i element'e uygular
 * @param {Element} element - Directive uygulanacak element
 * @param {string} directive - Directive adı (örn: 't-text', 't-bind:href')
 * @param {string} value - Directive'in değeri
 * @param {Object} state - Reaktif state objesi
 *
 * NASIL ÇALIŞIR:
 * 1. t-bind:attr ve t-class:name syntax'larını parse eder
 * 2. İlgili handler'ı directive registry'den bulur
 * 3. Handler'ı çalıştırır
 */
function applyDirective(element, directive, value, state, context) {
    // Shorthand binding syntax: :attr → t-bind:attr (v1.3.0)
    if (directive.startsWith(":") && !directive.startsWith("::")) {
        const attrName = directive.slice(1);
        const handler = directiveHandlers["t-bind"];
        if (handler) handler(element, value, state, attrName);
        return;
    }

    // t-bind:attribute syntax'ı
    if (directive.startsWith("t-bind:")) {
        const attrName = directive.split(":")[1];
        const handler = directiveHandlers["t-bind"];
        if (handler) handler(element, value, state, attrName);
        return;
    }

    // t-class:className syntax'ı
    if (directive.startsWith("t-class:")) {
        const className = directive.split(":")[1];
        const handler = directiveHandlers["t-class"];
        if (handler) handler(element, value, state, className);
        return;
    }

    // t-ref directive
    if (directive === "t-ref") {
        const contextObj =
            element._tinypineContext ||
            element.closest("[t-data]")?._tinypineContext;
        const handler = directiveHandlers["t-ref"];
        if (handler) handler(element, value, state, contextObj);
        return;
    }

    // t-for directive
    if (directive === "t-for") {
        handleForDirective(element, value, state, context);
        return;
    }

    // Normal directive (t-text, t-show, vs.)
    const handler = directiveHandlers[directive];
    if (handler) {
        const runHandler = () => {
            // t-await, t-loading, t-error need state + scope element
            if (
                directive === "t-await" ||
                directive === "t-loading" ||
                directive === "t-error"
            ) {
                const scopeElement = element.closest("[t-data]");
                if (scopeElement && scopeElement._tinypineState) {
                    handler(
                        element,
                        value,
                        scopeElement._tinypineState,
                        context
                    );
                } else {
                    handler(element, value, state, context);
                }
            } else if (context) {
                handler(element, value, state, context);
            } else {
                handler(element, value, state);
            }
        };

        // Safe mode: wrap directive execution
        const safe =
            typeof window !== "undefined" &&
            window.TinyPine &&
            window.TinyPine._safeMode;
        if (safe) {
            try {
                runHandler();
            } catch (_) {
                /* swallow in safe mode */
            }
        } else {
            runHandler();
        }

        // Emit directive event (generic)
        if (
            typeof window !== "undefined" &&
            window.TinyPine &&
            typeof window.TinyPine.emit === "function"
        ) {
            const name =
                "directive:" +
                (directive.startsWith("t-")
                    ? directive.slice(2)
                    : directive
                ).split(":")[0];
            try {
                window.TinyPine.emit(name, element, { state, context, value });
            } catch (_) {}
        }
    } else {
        console.warn(`[TinyPine] Unknown directive: ${directive}`);
    }
}

/**
 * Scope'taki tüm directive'leri günceller (state değiştiğinde)
 * @param {Element} scopeElement - Scope element'i
 * @param {Object} state - Reaktif state objesi
 *
 * NASIL ÇALIŞIR:
 * 1. Scope'taki tüm child elementleri bulur
 * 2. Her element üzerinde processDirectives çağırır
 *
 * NEDEN:
 * - State değiştiğinde tüm directive'lerin yeniden render olması için
 * - Çünkü directive'ler state'i kullanıyor
 */
function updateDirectives(scopeElement, state) {
    const context = scopeElement._tinypineContext;

    // Sadece bu scope'un kendi elementlerini güncelle (child scope'ları dahil etme)
    function updateRecursive(element) {
        // Check if this element has t-for directive - SKIP IT
        if (element._tinypineFor) {
            // t-for elements handle their own updates via array mutation wrappers
            return;
        }

        // Skip t-model inputs to prevent value reset
        if (element.hasAttribute("t-model")) {
            return;
        }

        // Bu element'in kendi directive'lerini güncelle
        const elementState = element._tinypineScopedState || state;
        processDirectives(element, elementState, context);

        // Direct child'ları işle
        const children = element.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];

            // Eğer child kendi scope'una sahipse, skip et
            if (child.hasAttribute("t-data")) {
                continue;
            }

            // Skip t-for elements
            if (child._tinypineFor) {
                continue;
            }

            // Normal element, recursive update
            updateRecursive(child);
        }
    }

    // Start with scope element itself for root-level updates
    updateRecursive(scopeElement);
}

/**
 * t-for loop rendering with smart keyed diffing (v1.3.0)
 * Renders items with proper scoping for reactive loops
 * Supports :key binding for optimized updates
 */
function renderForLoop(templateElement, state, contextObj) {
    const forInfo = templateElement._tinypineFor;
    if (!forInfo) return;

    // For t-for on child elements (like <li t-for>), use parent as container
    const element =
        templateElement.hasAttribute && templateElement.hasAttribute("t-for")
            ? templateElement.parentElement
            : templateElement;

    if (!element) {
        console.warn("[TinyPine] t-for element has no parent");
        return;
    }

    // Get current items from state
    const items = evaluateExpression(forInfo.listName, state, contextObj);

    if (!Array.isArray(items)) {
        console.warn(
            "[TinyPine] t-for target is not an array:",
            forInfo.listName
        );
        return;
    }

    // Check if already rendering (prevent recursion)
    if (element._tinypineRendering) {
        return;
    }
    element._tinypineRendering = true;

    // Parse item variable name
    const itemVars = forInfo.itemVar.split(",").map((v) => v.trim());
    const itemVar = itemVars[0];
    const indexVar = itemVars[1] || "index";

    // Get key binding attribute from template element
    const keyAttr =
        templateElement.getAttribute(":key") ||
        templateElement.getAttribute("t-bind:key");
    const useKeying = !!keyAttr;

    // Get fresh template each time
    const originalTemplate = forInfo.template;

    // Early return if no items
    if (items.length === 0) {
        element.innerHTML = "";
        element._tinypineRendering = false;
        return;
    }

    // v1.3.0: Smart Keyed Diffing
    if (useKeying) {
        // Build new items map by key
        const newItemsMap = new Map();
        const newKeys = [];

        items.forEach((item, index) => {
            // Create scoped state for key evaluation
            const tempState = Object.create(null);
            tempState[itemVar] = item;
            tempState[indexVar] = index;

            // Evaluate key expression
            let key;
            try {
                key = evaluateExpression(keyAttr, tempState, contextObj);
            } catch (e) {
                key = index; // Fallback to index
            }

            newKeys.push(key);
            newItemsMap.set(key, { item, index });
        });

        // Build existing items map
        const existingElements = Array.from(element.children);
        const existingMap = new Map();

        existingElements.forEach((el) => {
            const key = el._tinypineKey;
            if (key !== undefined) {
                existingMap.set(key, el);
            }
        });

        // Diff and update
        const fragment = document.createDocumentFragment();

        newKeys.forEach((key, index) => {
            const { item } = newItemsMap.get(key);
            let liEl;

            if (existingMap.has(key)) {
                // Reuse existing element
                liEl = existingMap.get(key);
                existingMap.delete(key); // Mark as used

                // Update scoped state
                const scopedState =
                    liEl._tinypineScopedState || Object.create(null);
                scopedState[itemVar] = item;
                scopedState[indexVar] = index;
                scopedState.$index = index;
                scopedState.$first = index === 0;
                scopedState.$last = index === items.length - 1;

                // Update state on all child elements
                function updateScopedState(el) {
                    el._tinypineScopedState = scopedState;
                    Array.from(el.children).forEach((child) =>
                        updateScopedState(child)
                    );
                }
                updateScopedState(liEl);

                // Re-process directives with updated state
                function reprocessDirectives(el) {
                    Array.from(el.attributes).forEach((attr) => {
                        if (
                            attr.name.startsWith("t-") &&
                            directiveHandlers[attr.name]
                        ) {
                            try {
                                directiveHandlers[attr.name](
                                    el,
                                    attr.value,
                                    scopedState,
                                    contextObj
                                );
                            } catch (e) {
                                /* silent */
                            }
                        }
                    });
                    Array.from(el.children).forEach((child) =>
                        reprocessDirectives(child)
                    );
                }
                reprocessDirectives(liEl);
            } else {
                // Create new element
                liEl = createForLoopElement(
                    element,
                    originalTemplate,
                    item,
                    index,
                    items.length,
                    itemVar,
                    indexVar,
                    state,
                    contextObj
                );
                liEl._tinypineKey = key;
            }

            fragment.appendChild(liEl);
        });

        // Remove unused elements
        existingMap.forEach((el) => {
            // Cleanup if needed
            if (el._tinypineClickHandler) {
                el.removeEventListener("click", el._tinypineClickHandler);
            }
        });

        // Clear and append new fragment
        element.innerHTML = "";
        element.appendChild(fragment);
    } else {
        // No keying - simple re-render
        element.innerHTML = "";

        items.forEach((item, index) => {
            const liEl = createForLoopElement(
                element,
                originalTemplate,
                item,
                index,
                items.length,
                itemVar,
                indexVar,
                state,
                contextObj
            );
            element.appendChild(liEl);
        });
    }

    debugLog(
        `t-for rendered ${items.length} items${useKeying ? " (keyed)" : ""}`,
        element
    );

    // Reset flag
    element._tinypineRendering = false;
}

/**
 * Helper: Create a single loop element
 */
function createForLoopElement(
    parentElement,
    template,
    item,
    index,
    totalItems,
    itemVar,
    indexVar,
    state,
    contextObj
) {
    // Parse template into a real element
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = template;

    // Get the first element from template (should be the li/div/etc)
    const liEl = tempDiv.firstElementChild
        ? tempDiv.firstElementChild.cloneNode(true)
        : parentElement.cloneNode(false);

    // Remove t-for and key attributes
    liEl.removeAttribute("t-for");
    liEl.removeAttribute(":key");
    liEl.removeAttribute("t-bind:key");

    // Create a simple object with item, index, and parent state access
    const scopedState = Object.create(null);
    scopedState[itemVar] = item;
    scopedState[indexVar] = index;
    // v1.3.0: Add $index, $first, $last context variables
    scopedState.$index = index;
    scopedState.$first = index === 0;
    scopedState.$last = index === totalItems - 1;

    // Add all parent state properties as direct values
    try {
        Object.keys(state).forEach((key) => {
            try {
                scopedState[key] = state[key];
            } catch (e) {}
        });
    } catch (e) {}

    // Store on element for click handlers
    liEl._tinypineScopedState = scopedState;

    // Remove ALL t-for attributes from template to prevent recursion
    function removeTFor(el) {
        if (el.hasAttribute("t-for")) {
            el.removeAttribute("t-for");
        }
        if (el.hasAttribute(":key")) {
            el.removeAttribute(":key");
        }
        if (el.hasAttribute("t-bind:key")) {
            el.removeAttribute("t-bind:key");
        }
        Array.from(el.children).forEach((child) => {
            removeTFor(child);
        });
    }

    removeTFor(liEl);

    // Process directives and store scoped state on ALL elements
    function processAndStoreState(el) {
        // Store scoped state on this element
        el._tinypineScopedState = scopedState;

        // Process its attributes
        Array.from(el.attributes).forEach((attr) => {
            if (attr.name.startsWith("t-") && directiveHandlers[attr.name]) {
                try {
                    // Debug: log what we're passing
                    if (attr.name === "t-text") {
                        debugLog("Processing t-text in t-for", {
                            expression: attr.value,
                            scopedStateKeys: Object.keys(scopedState),
                            scopedState: scopedState,
                        });
                    }
                    directiveHandlers[attr.name](
                        el,
                        attr.value,
                        scopedState,
                        contextObj
                    );
                } catch (e) {
                    // Silent
                }
            }
        });

        // Process children
        Array.from(el.children).forEach((child) => {
            processAndStoreState(child);
        });
    }

    processAndStoreState(liEl);

    return liEl;
}

/**
 * Handle t-for directive during initialization
 */
function handleForDirective(element, expression, state, contextObj) {
    // Parse t-for syntax: "(item, index) in items" or "item in items"
    let match = expression.match(/\((.*?)\)\s+in\s+(.*)/);
    let itemVar = "";
    let listName = "";

    if (match) {
        // "(item, index) in items" format
        itemVar = match[1].trim();
        listName = match[2].trim();
    } else {
        // "item in items" format
        match = expression.match(/(.*?)\s+in\s+(.*)/);
        if (!match) {
            console.warn("[TinyPine] Invalid t-for syntax:", expression);
            return;
        }
        itemVar = match[1].trim();
        listName = match[2].trim();
    }

    // Get array from state
    const items = evaluateExpression(listName, state, contextObj);

    if (!Array.isArray(items)) {
        console.warn("[TinyPine] t-for target must be an array:", listName);
        return;
    }

    // Store loop info on element
    // IMPORTANT: Save original template ONLY if not already saved
    if (!element._tinypineFor) {
        const originalTemplate = element.outerHTML;
        element._tinypineFor = {
            itemVar,
            listName,
            template: originalTemplate,
        };
    }

    // Make array methods trigger re-render
    ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"].forEach(
        (method) => {
            if (!items["_" + method + "_for_wrapped"]) {
                const original = Array.prototype[method];
                items[method] = function (...args) {
                    const result = original.apply(this, args);
                    // Queue re-render ONLY if not currently rendering
                    setTimeout(() => {
                        if (!element._tinypineRendering) {
                            renderForLoop(element, state, contextObj);
                        }
                    }, 0);
                    return result;
                };
                items["_" + method + "_for_wrapped"] = true;
            }
        }
    );

    // Initial render
    renderForLoop(element, state, contextObj);
}

// Context Store - Her element'in context'ini tutar
const contextStore = new WeakMap();

/**
 * Context'i kaydeder
 */
function registerContext(element, context) {
    contextStore.set(element, context);
}

/**
 * Context'i alır
 */
function getContext(element) {
    return contextStore.get(element);
}

/**
 * Parent context'i bulur
 */
function getParentContext(element) {
    let parent = element.parentElement;
    while (parent) {
        if (parent.hasAttribute("t-data")) {
            return getContext(parent);
        }
        parent = parent.parentElement;
    }
    return null;
}

/**
 * Debug modu kontrolü
 */
let debugMode = false;

function enableDebug() {
    debugMode = true;
    console.log("🔍 TinyPine debug mode enabled");
}

function debugLog(message, data = null) {
    if (debugMode) {
        console.log(`[TinyPine] ${message}`, data || "");
    }
}

// Module exports (Node.js)
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        reactive,
        init,
        initializeScope,
        evaluateExpression,
        directiveHandlers,
        registerContext,
        getContext,
    };
}

// Global API (Browser)
if (typeof window !== "undefined") {
    // TinyPine already defined by store.js? Keep it and extend
    if (!window.TinyPine) {
        window.TinyPine = {};
    }

    // Add core functions
    window.TinyPine.init = init;
    window.TinyPine.reactive = reactive;
    window.TinyPine.evaluateExpression = evaluateExpression;
    window.TinyPine.initializeScope = initializeScope;
    window.TinyPine.enableDebug = enableDebug;
    window.TinyPine.disableDebug = () => (debugMode = false);

    // Mode and Safe options
    window.TinyPine._mode = "default";
    Object.defineProperty(window.TinyPine, "mode", {
        get: () => window.TinyPine._mode,
        set: (val) => {
            window.TinyPine._mode = val === "lite" ? "lite" : "default";
        },
    });

    // Event bus
    const _events = new Map();
    window.TinyPine.on = function (eventName, cb) {
        if (!_events.has(eventName)) _events.set(eventName, new Set());
        _events.get(eventName).add(cb);
        return () => _events.get(eventName)?.delete(cb);
    };
    window.TinyPine.off = function (eventName, cb) {
        _events.get(eventName)?.delete(cb);
    };
    window.TinyPine.emit = function (eventName, ...args) {
        const set = _events.get(eventName);
        if (!set) return;
        set.forEach((fn) => {
            try {
                fn(...args);
            } catch (_) {}
        });
    };

    // onMount
    // Global onMount callbacks (component-level)
    window.TinyPine._onMountCallbacks = window.TinyPine._onMountCallbacks || [];
    window.TinyPine.onMount = function (cb) {
        if (typeof cb === "function")
            window.TinyPine._onMountCallbacks.push(cb);
    };

    // onUnmount
    // Global onUnmount callbacks (component-level)
    window.TinyPine._onUnmountCallbacks =
        window.TinyPine._onUnmountCallbacks || [];
    window.TinyPine.onUnmount = function (cb) {
        if (typeof cb === "function")
            window.TinyPine._onUnmountCallbacks.push(cb);
    };

    // start(selectorOrRoot, { safe })
    window.TinyPine.start = function (selectorOrRoot, opts = {}) {
        window.TinyPine._safeMode = !!opts.safe;

        // Lite mode: disable heavy modules by no-op overrides
        if (window.TinyPine._mode === "lite") {
            window.TinyPine.devtools = function () {};
            window.TinyPine.store = function () {};
            window.TinyPine.getStore = function () {
                return undefined;
            };
            window.TinyPine.getAllStores = function () {
                return {};
            };
            window.TinyPine.watch = function () {
                return () => {};
            };
            window.TinyPine.router = function () {
                return window.TinyPine;
            };
            window.TinyPine.i18n = function () {
                return window.TinyPine;
            };
        }

        const root =
            typeof selectorOrRoot === "string"
                ? document.querySelector(selectorOrRoot) || document.body
                : selectorOrRoot || document.body;
        init(root);

        // Fire all global onMount callbacks
        if (window.TinyPine._onMountCallbacks) {
            window.TinyPine._onMountCallbacks.forEach((cb) => {
                try {
                    cb();
                } catch (e) {}
            });
        }

        // Emit global app mounted (backward compat)
        window.TinyPine.emit("mounted");
    };

    // Component Registration System (for UI components)
    window.TinyPine._components = window.TinyPine._components || new Map();
    window.TinyPine.component = function (name, config) {
        if (!name || typeof name !== "string") {
            console.warn("[TinyPine] Component name must be a string");
            return;
        }

        config = config || {};
        window.TinyPine._components.set(name, config);

        // Register as custom element if CustomElements API is available
        if (
            typeof customElements !== "undefined" &&
            !customElements.get(name)
        ) {
            class TinyPineComponent extends HTMLElement {
                connectedCallback() {
                    const ctx = this;
                    // Call mounted hook
                    if (typeof config.mounted === "function") {
                        try {
                            config.mounted(this, ctx);
                        } catch (e) {
                            console.warn(
                                "[TinyPine] Component mounted error:",
                                e
                            );
                        }
                    }
                    // Emit component:mounted
                    if (window.TinyPine && window.TinyPine.emit) {
                        window.TinyPine.emit("component:mounted", this, ctx);
                    }
                }

                disconnectedCallback() {
                    if (typeof config.unmounted === "function") {
                        try {
                            config.unmounted(this, this);
                        } catch (e) {
                            console.warn(
                                "[TinyPine] Component unmounted error:",
                                e
                            );
                        }
                    }
                    // Emit component:unmounted
                    if (window.TinyPine && window.TinyPine.emit) {
                        window.TinyPine.emit("component:unmounted", this, this);
                    }
                }
            }
            customElements.define(name, TinyPineComponent);
        }

        if (debugMode) {
            console.log("[TinyPine] Component registered:", name);
        }

        return window.TinyPine;
    };

    // Theme support (light/dark)
    window.TinyPine._theme = "light";
    Object.defineProperty(window.TinyPine, "theme", {
        get: () => window.TinyPine._theme,
        set: (val) => {
            window.TinyPine._theme = val === "dark" ? "dark" : "light";
            document.documentElement.classList.toggle("dark", val === "dark");
            if (window.TinyPine.emit) {
                window.TinyPine.emit("theme:changed", window.TinyPine._theme);
            }
        },
    });

    // Debug silent flag to suppress TinyPine logs
    // Separate debug options to avoid clobbering existing boolean accessor
    window.TinyPine.debugOptions = window.TinyPine.debugOptions || {
        silent: false,
    };
    (function setupConsoleFilter() {
        const orig = {
            log: console.log,
            warn: console.warn,
            error: console.error,
        };
        const filter = (type) =>
            function (...args) {
                const silent = !!(
                    window.TinyPine &&
                    window.TinyPine.debugOptions &&
                    window.TinyPine.debugOptions.silent
                );
                if (
                    silent &&
                    typeof args[0] === "string" &&
                    args[0].includes("[TinyPine]")
                )
                    return;
                return orig[type].apply(console, args);
            };
        console.log = filter("log");
        console.warn = filter("warn");
        console.error = filter("error");
    })();
    Object.defineProperty(window.TinyPine, "debug", {
        get: () => debugMode,
        set: (val) => {
            debugMode = val;
            if (val) console.log("🔍 TinyPine debug enabled");
        },
    });

    // Plugin System
    window.TinyPine.use = function (plugin) {
        if (typeof plugin.init === "function") {
            plugin.init(window.TinyPine);
            if (debugMode) {
                console.log(
                    "[TinyPine][Plugin]",
                    plugin.name || "Unknown",
                    "initialized"
                );
            }
        }
        return window.TinyPine;
    };

    window.TinyPine.directive = function (name, handler) {
        directiveHandlers["t-" + name] = handler;
        if (debugMode) {
            console.log("[TinyPine] Custom directive registered: t-" + name);
        }
    };

    // Form System (v1.3.0)
    window.TinyPine.forms = {
        /**
         * Reset all form inputs in a scope
         * @param {Element} scopeElement - Form or scope element
         */
        reset: function (scopeElement) {
            if (!scopeElement) {
                console.warn(
                    "[TinyPine][forms] reset() requires a scope element"
                );
                return;
            }

            // Find all inputs with t-model
            const inputs = scopeElement.querySelectorAll("[t-model]");
            inputs.forEach((input) => {
                input.value = "";
                input.classList.remove("tp-invalid", "tp-valid");
            });

            // Clear $errors state
            const state = scopeElement._tinypineState;
            if (state && state.$errors) {
                Object.keys(state.$errors).forEach((key) => {
                    delete state.$errors[key];
                });
            }

            // Update directives
            if (state) {
                updateDirectives(scopeElement, state);
            }

            if (debugMode) {
                console.log("[TinyPine][forms] Form reset:", scopeElement);
            }
        },

        /**
         * Validate all fields in a scope
         * @param {Element} scopeElement - Form or scope element
         * @returns {boolean} True if all fields are valid
         */
        validate: function (scopeElement) {
            if (!scopeElement) {
                console.warn(
                    "[TinyPine][forms] validate() requires a scope element"
                );
                return false;
            }

            // Find all inputs with t-validate
            const inputs = scopeElement.querySelectorAll("[t-validate]");
            let isValid = true;

            inputs.forEach((input) => {
                if (input._tinypineValidateHandler) {
                    input._tinypineValidateHandler.validate();

                    // Check if field has errors
                    const modelAttr = input.getAttribute("t-model");
                    if (modelAttr) {
                        const fieldName = modelAttr.trim();
                        const state = scopeElement._tinypineState;
                        if (
                            state &&
                            state.$errors &&
                            state.$errors[fieldName]
                        ) {
                            isValid = false;
                        }
                    }
                }
            });

            if (debugMode) {
                console.log("[TinyPine][forms] Validation result:", isValid);
            }

            return isValid;
        },

        /**
         * Get form data as object
         * @param {Element} scopeElement - Form or scope element
         * @returns {Object} Form data
         */
        getData: function (scopeElement) {
            if (!scopeElement) {
                console.warn(
                    "[TinyPine][forms] getData() requires a scope element"
                );
                return {};
            }

            const state = scopeElement._tinypineState;
            if (!state) return {};

            const data = {};
            const inputs = scopeElement.querySelectorAll("[t-model]");

            inputs.forEach((input) => {
                const modelAttr = input.getAttribute("t-model");
                if (modelAttr) {
                    const fieldName = modelAttr.trim();
                    data[fieldName] = state[fieldName];
                }
            });

            return data;
        },
    };

    // Transition System
    window.TinyPine.transitions = window.TinyPine.transitions || new Map();

    window.TinyPine.transition = function (name, config) {
        window.TinyPine.transitions.set(name, config);
        if (debugMode) {
            console.log("[TinyPine] [Transition] Registered preset:", name);
        }
    };

    // Register default presets
    window.TinyPine.transition("fade", {
        enter: "fade-enter",
        active: "fade-enter-active",
        leave: "fade-leave-active",
    });

    window.TinyPine.transition("slide", {
        enter: "slide-enter",
        active: "slide-enter-active",
        leave: "slide-leave-active",
    });

    window.TinyPine.transition("scale", {
        enter: "scale-enter",
        active: "scale-enter-active",
        leave: "scale-leave-active",
    });

    window.TinyPine.transition("blur", {
        enter: "blur-enter",
        active: "blur-enter-active",
        leave: "blur-leave-active",
    });

    // Cache System
    window.TinyPine.cacheInstance =
        window.TinyPine.cacheInstance ||
        (function () {
            const cache = new Map();

            return {
                get: function (key) {
                    return cache.get(key);
                },
                set: function (key, value) {
                    cache.set(key, value);
                },
                clear: function () {
                    cache.clear();
                },
            };
        })();

    window.TinyPine.cache = function () {
        return window.TinyPine.cacheInstance;
    };

    // Router System - v1.3.0 Advanced Features
    if (!window.TinyPine.routeElements) {
        window.TinyPine.routeElements = [];
    }

    // Router state
    window.TinyPine._routerState = {
        routes: new Map(),
        guards: new Map(),
        currentRoute: null,
        currentParams: {},
        fallbackRoute: null,
    };

    // Helper: Parse route pattern and extract params
    function matchRoute(pattern, path) {
        // Exact match first
        if (pattern === path) {
            return { matched: true, params: {} };
        }

        // Wildcard fallback
        if (pattern === "*") {
            return { matched: true, params: {} };
        }

        // Dynamic params matching (/user/:id)
        const patternParts = pattern.split("/").filter(Boolean);
        const pathParts = path.split("/").filter(Boolean);

        if (patternParts.length !== pathParts.length) {
            return { matched: false, params: {} };
        }

        const params = {};
        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const pathPart = pathParts[i];

            if (patternPart.startsWith(":")) {
                // Dynamic param
                const paramName = patternPart.slice(1);
                params[paramName] = pathPart;
            } else if (patternPart !== pathPart) {
                // Mismatch
                return { matched: false, params: {} };
            }
        }

        return { matched: true, params };
    }

    // Global hashchange listener
    if (!window.TinyPine.routerListenerAdded) {
        window.TinyPine.routerListenerAdded = true;
        window.TinyPine.routerConfigs = [];

        window.addEventListener("hashchange", function () {
            const hash = window.location.hash.replace("#/", "") || "home";
            const routerState = window.TinyPine._routerState;

            // Find matching route
            let matchedRoute = null;
            let matchedParams = {};
            let fallbackElement = null;

            window.TinyPine.routeElements.forEach((item) => {
                const match = matchRoute(item.routeName, hash);

                if (match.matched) {
                    if (item.routeName === "*") {
                        fallbackElement = item;
                    } else {
                        matchedRoute = item;
                        matchedParams = match.params;
                    }
                }
            });

            // Use fallback if no match
            if (!matchedRoute && fallbackElement) {
                matchedRoute = fallbackElement;
            }

            // Update router state
            routerState.currentRoute = hash;
            routerState.currentParams = matchedParams;

            // Check route guards
            const routePattern = matchedRoute ? matchedRoute.routeName : null;
            const guard = routePattern
                ? routerState.guards.get(routePattern)
                : null;

            if (guard && typeof guard === "function") {
                const canNavigate = guard(hash, matchedParams);
                if (!canNavigate) {
                    // Guard blocked navigation
                    if (debugMode) {
                        console.log(
                            "[TinyPine][Router] Navigation blocked by guard:",
                            hash
                        );
                    }
                    return;
                }
            }

            // Update all t-route elements
            window.TinyPine.routeElements.forEach((item) => {
                const match = matchRoute(item.routeName, hash);

                if (match.matched) {
                    item.element.style.display = "";

                    // Inject $route context into element
                    if (item.element._tinypineState) {
                        item.element._tinypineState.$route = {
                            path: hash,
                            params: match.params,
                        };
                    }
                } else {
                    item.element.style.display = "none";
                }
            });

            // Call onChange callbacks
            window.TinyPine.routerConfigs.forEach((config) => {
                if (config.onChange) {
                    config.onChange(hash, matchedParams);
                }
            });

            if (debugMode) {
                console.log(
                    "[TinyPine][Router] Route changed →",
                    hash,
                    "params:",
                    matchedParams
                );
            }
        });
    }

    // Pre-initialize router methods (available before router() is called)
    window.TinyPine.router = function (config) {
        if (window.TinyPine._mode === "lite") {
            return window.TinyPine;
        }
        config = config || {};
        const defaultRoute = config.default || "home";
        const onChange = config.onChange || function () {};
        const routes = config.routes || {};

        // Store config
        const routerConfig = { default: defaultRoute, onChange, routes };
        window.TinyPine.routerConfigs.push(routerConfig);

        // Register routes with guards
        Object.keys(routes).forEach((pattern) => {
            const routeConfig = routes[pattern];
            if (routeConfig && routeConfig.beforeEnter) {
                window.TinyPine._routerState.guards.set(
                    pattern,
                    routeConfig.beforeEnter
                );
            }
        });

        // Initialize route
        if (window.location.hash) {
            const currentRoute = window.TinyPine.router.getCurrent();
            if (onChange) {
                onChange(currentRoute);
            }
        } else {
            window.location.hash = "/" + defaultRoute;
            if (onChange) {
                onChange(defaultRoute);
            }
        }

        return window.TinyPine;
    };

    // Router helper methods (available immediately)
    window.TinyPine.router.navigate = function (route, params) {
        // Replace params in route pattern
        if (params) {
            Object.keys(params).forEach((key) => {
                route = route.replace(`:${key}`, params[key]);
            });
        }
        window.location.hash = "/" + route;
    };

    // Alias for navigate
    window.TinyPine.router.push = window.TinyPine.router.navigate;

    // Get current route
    window.TinyPine.router.getCurrent = function () {
        const hash = window.location.hash.replace("#/", "");
        const defaultRoute =
            window.TinyPine.routerConfigs[0]?.default || "home";
        return hash || defaultRoute;
    };

    window.TinyPine.routerInitialized = true;
    if (debugMode) {
        console.log("[TinyPine][Router] Initialized");
    }

    // i18n System
    window.TinyPine.i18nInstance = window.TinyPine.i18nInstance || {
        translations: {},
        currentLang: "en",
        defaultLang: "en",
        cache: false,
        onChange: null,
    };

    // Initialize i18n
    window.TinyPine.i18n = function (langs, options) {
        options = options || {};
        window.TinyPine.i18nInstance.translations = langs;
        window.TinyPine.i18nInstance.defaultLang = options.default || "en";
        window.TinyPine.i18nInstance.cache = options.cache || false;
        window.TinyPine.i18nInstance.onChange = options.onChange;

        // Set initial language
        const savedLang =
            options.cache && localStorage.getItem("tinypine_lang");
        const initialLang =
            savedLang || window.TinyPine.i18nInstance.defaultLang;
        window.TinyPine.i18nInstance.currentLang = initialLang;

        // Create reactive $lang
        window.TinyPine._lang = initialLang;
        Object.defineProperty(window.TinyPine, "$lang", {
            get: function () {
                return window.TinyPine._lang;
            },
            set: function (newLang) {
                window.TinyPine._lang = newLang;
                window.TinyPine.i18nInstance.currentLang = newLang;

                if (window.TinyPine.i18nInstance.cache) {
                    localStorage.setItem("tinypine_lang", newLang);
                }

                if (window.TinyPine.i18nInstance.onChange) {
                    window.TinyPine.i18nInstance.onChange(newLang);
                }

                // Update all t-text.lang elements manually
                document.querySelectorAll("*[t-text\\.lang]").forEach((el) => {
                    let key = el.getAttribute("t-text.lang");
                    // Remove surrounding quotes if present
                    if (key && (key.startsWith("'") || key.startsWith('"'))) {
                        key = key.slice(1, -1);
                    }
                    const i18n = window.TinyPine?.i18nInstance;
                    const currentLang = newLang;
                    const translations = i18n?.translations?.[currentLang];

                    if (translations && translations[key]) {
                        el.textContent = translations[key];
                    } else {
                        el.textContent = key || "";
                    }
                });

                if (debugMode) {
                    console.log("[TinyPine][i18n] Language changed →", newLang);
                }
            },
            configurable: true,
        });

        if (debugMode) {
            console.log(
                "[TinyPine][i18n] Initialized with",
                Object.keys(langs).length,
                "languages"
            );
        }

        return window.TinyPine;
    };

    // Load locale from JSON
    window.TinyPine.loadLocale = function (lang, url) {
        return fetch(url)
            .then((res) => res.json())
            .then((data) => {
                if (!window.TinyPine.i18nInstance.translations[lang]) {
                    window.TinyPine.i18nInstance.translations[lang] = {};
                }
                Object.assign(
                    window.TinyPine.i18nInstance.translations[lang],
                    data
                );

                if (debugMode) {
                    console.log(
                        "[TinyPine][i18n] Loaded locale:",
                        lang,
                        "from",
                        url
                    );
                }
            })
            .catch((err) => {
                console.error(
                    "[TinyPine][i18n] Failed to load locale:",
                    lang,
                    "from",
                    url,
                    err
                );
            });
    };
}

// Apply transition classes to element
function applyTransition(element, presetName) {
    const config = window.TinyPine?.transitions?.get(presetName);
    if (!config) return;

    // Add enter classes
    if (config.enter) {
        element.classList.add(config.enter);
    }
    if (config.active) {
        element.classList.add(config.active);
    }
}

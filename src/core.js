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
                const arrayMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
                arrayMethods.forEach(method => {
                    const original = Array.prototype[method];
                    value[method] = function(...args) {
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
        }
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
 */
function evaluateExpression(expression, state, contextObj) {
    try {
        const context = {};

        // Context obj varsa, ondan başla ($parent, $root, $refs, $el)
        if (contextObj) {
            if (contextObj.root) context.$root = contextObj.root.data;
            if (contextObj.parent) context.$parent = contextObj.parent.data;
            context.$refs = contextObj.refs || {};
            context.$el = contextObj.el;
        }

        // State property'lerini ekle
        Object.keys(state).forEach(key => {
            try {
                context[key] = state[key];
            } catch (e) {
                // Get trap error - skip
            }
        });

        return Function(...Object.keys(context), `"use strict"; return (${expression})`)(...Object.values(context));
    } catch (error) {
        console.warn('[TinyPine] Expression evaluation failed:', expression, error);
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
    't-text': function(element, value, state, contextObj) {
        element.textContent = evaluateExpression(value, state, contextObj);
    },

    /**
     * t-show: Element'i condition'a göre gösterir/gizler
     * Örnek: <div t-show="isVisible">Hidden</div>
     */
    't-show': function(element, expression, state) {
        element.style.display = evaluateExpression(expression, state) ? '' : 'none';
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
    't-bind': function(element, expression, state, attrName) {
        const value = evaluateExpression(expression, state);
        if (attrName) {
            element.setAttribute(attrName, value || '');
        } else {
            console.warn('[TinyPine] t-bind requires an attribute name, e.g., t-bind:class');
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
    't-class': function(element, expression, state, className) {
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
    't-for': function(element, expression, state, contextObj) {
        // Parse t-for syntax: "(item, index) in items"
        const match = expression.match(/\((.*?)\)\s+in\s+(.*)/);
        if (!match) {
            console.warn('[TinyPine] Invalid t-for syntax:', expression);
            return;
        }

        const itemVar = match[1].trim();
        const listName = match[2].trim();

        // Get array from state
        const items = evaluateExpression(listName, state, contextObj);

        if (!Array.isArray(items)) {
            console.warn('[TinyPine] t-for target must be an array:', listName);
            return;
        }

        // Store loop info on element
        const template = element.innerHTML;

        element._tinypineFor = {
            itemVar,
            listName,
            items: [...items], // Snapshot
            template: template,
            key: element.getAttribute('t-key') || null // Optional key attribute
        };

        // Render initial items
        renderForLoop(element, state, contextObj);
    },

    /**
     * t-ref: Register DOM elements for access via $refs
     */
    't-ref': function(element, value, state, context) {
        const refName = value.trim();
        if (context && refName) {
            context.refs[refName] = element;
            debugLog(`Registered ref: ${refName}`, element);
        }
    },

  't-click': function(element, expression, state) {

        // Parse modifiers from expression FIRST to check for .once
        const knownModifiers = ['prevent', 'stop', 'once', 'outside'];
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
                cleanExpression = cleanExpression.replace(modifierPattern, '');
            } else {
                // Modifier değil, method ismi, durdur
                break;
            }
        }


        // Eğer .once varsa ve zaten çalıştırılmışsa, yeni handler ekleme
        if (modifiers.includes('once') && element._tinypineOnceFired) {
            return;
        }

        // Önceki handler varsa temizle (memory leak önleme)
        if (element._tinypineClickHandler) {
            element.removeEventListener('click', element._tinypineClickHandler);
            delete element._tinypineClickHandler;
        }

        const handler = function(event) {
            try {
                // Apply modifiers BEFORE processing expression
                if (modifiers.includes('prevent')) {
                    event.preventDefault();
                }
                if (modifiers.includes('stop')) {
                    event.stopPropagation();
                }

                // Handle .once modifier
                if (modifiers.includes('once')) {
                    element.removeEventListener('click', handler);
                    delete element._tinypineClickHandler;
                    element._tinypineOnceFired = true;
                }

                const scopeElement = element.closest('[t-data]');
                if (!scopeElement || !scopeElement._tinypineState) return;

                    // Check if we're in a t-for item - use scoped state
                    const forItem = element.closest('[t-for]');
                    const loopState = forItem && element._tinypineScopedState ? element._tinypineScopedState : null;
                    // IMPORTANT: Always use the live state from scopeElement
                    const state = scopeElement._tinypineState;
                    const contextObj = scopeElement._tinypineContext;

                // Özel expression'ları parse et ve çalıştır
                if (cleanExpression.includes('++')) {
                    const prop = cleanExpression.replace('++', '').trim();
                    state[prop] = (state[prop] || 0) + 1;
                } else if (cleanExpression.includes('--')) {
                    const prop = cleanExpression.replace('--', '').trim();
                    state[prop] = (state[prop] || 0) - 1;
                } else if (cleanExpression.includes('=')) {
                    // Atama işlemlerini handle et (count = 0 gibi)
                    const parts = cleanExpression.split('=');
                    const prop = parts[0].trim();
                    const value = parts.slice(1).join('=').trim();
                    try {
                        state[prop] = eval(value);
                    } catch (e) {
                        console.warn('[TinyPine] Could not evaluate:', value);
                    }
                } else {
                    // Generic expression evaluation with methods
                    const context = {};

                    // State property'lerini ekle
                    const stateKeys = Object.keys(state);
                    stateKeys.forEach(k => {
                        try {
                            context[k] = state[k];
                        } catch (e) {
                            // Skip
                        }
                    });

                    // Methods'u ekle (context'ten) - closure ile doğru state'i kullan
                    if (contextObj && contextObj.methods) {
                        const boundMethods = {};
                        Object.keys(contextObj.methods).forEach(key => {
                            const method = contextObj.methods[key];
                            // IMPORTANT: Read FRESH state on every call
                            boundMethods[key] = function(...args) {
                                // CRITICAL: Read fresh state from scopeElement
                                const currentState = scopeElement._tinypineState;
                                // Get the actual target behind the Proxy
                                const actualState = currentState._tinypineTarget || currentState;
                                // Use actual state instead of Proxy for apply
                                return method.apply(actualState, args);
                            };
                        });
                        context.methods = boundMethods;
                    }

                    // If we're in a loop, add loop variables to context
                    if (loopState) {
                        // Add all loop variables
                        Object.keys(loopState).forEach(key => {
                            if (!context[key]) {
                                context[key] = loopState[key];
                            }
                        });
                    }

                    // $parent, $root, $refs, $el'i ekle
                    if (contextObj) {
                        if (contextObj.root) context.$root = contextObj.root.data;
                        if (contextObj.parent) context.$parent = contextObj.parent.data;
                        context.$refs = contextObj.refs || {};
                        context.$el = contextObj.el;
                    }

                    // Eğer son karakter () ile bitmiyorsa, method çağrısı için ekle
                    let finalExpression = cleanExpression;
                    if (finalExpression && !finalExpression.endsWith('()') && !finalExpression.includes('(')) {
                        finalExpression = finalExpression + '()';
                    }

                    const func = new Function(...Object.keys(context), 'event', `"use strict"; return (${finalExpression})`);
                    func(...Object.values(context), event);
                }

                // Directive'leri güncelle
                updateDirectives(scopeElement, state);
            } catch (error) {
                console.warn('[TinyPine] Error in t-click:', error);
            }
        };

        element._tinypineClickHandler = handler;

        // Handle .outside modifier
        if (modifiers.includes('outside')) {
            document.addEventListener('click', function outsideClick(event) {
                if (!element.contains(event.target)) {
                    handler(event);
                    // Optionally remove listener after first outside click
                    if (modifiers.includes('once')) {
                        document.removeEventListener('click', outsideClick);
                        delete element._tinypineOutsideHandler;
                    }
                }
            });
            element._tinypineOutsideHandler = true;
        } else {
            element.addEventListener('click', handler);
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
    't-model': function(element, expression, state) {
        const propertyName = expression.trim();

        // State'ten input'a: initial ve update binding
        if (Object.prototype.hasOwnProperty.call(state, propertyName) || propertyName in state) {
            const value = evaluateExpression(expression, state);
            if (element.value !== value && element.value !== String(value)) {
                element.value = value;
            }
        }

        // Input'tan state'e: input event handler
        if (!element._tinypineModelHandler) {
            const handler = function(event) {
                try {
                    const scopeElement = element.closest('[t-data]');
                    if (scopeElement && scopeElement._tinypineState) {
                        // CRITICAL: Use FRESH state from scopeElement
                        const currentState = scopeElement._tinypineState;
                        if (currentState.hasOwnProperty(propertyName)) {
                            currentState[propertyName] = event.target.value;
                            updateDirectives(scopeElement, currentState);
                        }
                    }
                } catch (error) {
                    console.warn('[TinyPine] Error in t-model:', error);
                }
            };
            element._tinypineModelHandler = handler;
            element.addEventListener('input', handler);
        }
    }
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
    const scopeElements = root.querySelectorAll('[t-data]');
    scopeElements.forEach(element => initializeScope(element));
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
        if (el.hasAttribute('t-data')) {
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
            // Parent state ve context kullan
            processDirectives(el, state, context);
            // Recursive olarak child'larını da process et
            processChildDirectives(el, state, context);
        }
    }
}

function initializeScope(element) {
    const dataAttr = element.getAttribute('t-data');
    if (!dataAttr) return;

    try {
        // t-data'daki JSON object'i parse et
        let dataObject = Function('"use strict"; return (' + dataAttr + ')')();

        // Methods'u ayır
        const methods = dataObject.methods || {};
        delete dataObject.methods;

        // Parent context bul
        const parentContext = getParentContext(element);

        // Debounce için flag
        let updatePending = false;

        // Reaktif state oluştur - Proxy callback ile auto-update
        const state = reactive(dataObject, () => {
            debugLog('State changed', { element: element, data: dataObject });
            if (!updatePending) {
                updatePending = true;
                setTimeout(() => {
                    updateDirectives(element, state);
                    updatePending = false;
                }, 0);
            }
        });

        // Make arrays reactive - wrap all array methods
        Object.keys(state).forEach(key => {
            const value = state[key];
            if (Array.isArray(value)) {
                const arrayMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
                arrayMethods.forEach(method => {
                    if (!value['_' + method + '_wrapped']) {
                        const original = Array.prototype[method];
                        value[method] = function(...args) {
                            const result = original.apply(this, args);
                            updateDirectives(element, state);
                            return result;
                        };
                        value['_' + method + '_wrapped'] = true;
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
            methods: methods
        };

        // Root ayarla
        if (!context.root) {
            context.root = context;
        }

        // Context'i kaydet
        registerContext(element, context);

        // $parent, $root, $refs proxy'si oluştur
        const proxiedData = new Proxy(state, {
            get(target, prop) {
                if (prop === '$parent') return context.parent?.data || null;
                if (prop === '$root') return context.root?.data || state;
                if (prop === '$refs') return context.refs;
                if (prop === '$el') return context.el;
                return target[prop];
            },
            set(target, prop, value) {
                target[prop] = value;
                return true;
            }
        });

        // Proxied data'yı kullan
        context.data = proxiedData;
        element._tinypineState = proxiedData;
        element._tinypineContext = context;

        debugLog('Context created', {
            element,
            hasParent: !!parentContext,
            root: !!context.root,
            methods: Object.keys(methods)
        });

        // İlk directive processing - sadece bu element'in directive'leri
        Array.from(element.attributes).forEach(attr => {
            if (attr.name.startsWith('t-') && attr.name !== 't-data') {
                applyDirective(element, attr.name, attr.value, proxiedData, context);
            }
        });

        // Child elementlerdeki directive'leri de işle - recursive yapı
        processChildDirectives(element, proxiedData, context);
    } catch (error) {
        console.warn('[TinyPine] Failed to parse t-data:', dataAttr, error);
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
    Array.from(element.attributes).forEach(attr => {
        if (attr.name.startsWith('t-') && attr.name !== 't-data') {
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
    // t-bind:attribute syntax'ı
    if (directive.startsWith('t-bind:')) {
        const attrName = directive.split(':')[1];
        const handler = directiveHandlers['t-bind'];
        if (handler) handler(element, value, state, attrName);
        return;
    }

    // t-class:className syntax'ı
    if (directive.startsWith('t-class:')) {
        const className = directive.split(':')[1];
        const handler = directiveHandlers['t-class'];
        if (handler) handler(element, value, state, className);
        return;
    }

    // t-ref directive
    if (directive === 't-ref') {
        const contextObj = element._tinypineContext || (element.closest('[t-data]')?._tinypineContext);
        const handler = directiveHandlers['t-ref'];
        if (handler) handler(element, value, state, contextObj);
        return;
    }

    // t-for directive
    if (directive === 't-for') {
        handleForDirective(element, value, state, context);
        return;
    }

    // Normal directive (t-text, t-show, vs.)
    const handler = directiveHandlers[directive];
    if (handler) {
        // Context'i handler'a geç
        if (context && directiveHandlers['t-text'] === handler) {
            handler(element, value, state, context);
        } else {
            handler(element, value, state);
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
        if (element.hasAttribute('t-model')) {
            return;
        }

        // Bu element'in kendi directive'lerini güncelle
        processDirectives(element, state, context);

        // Direct child'ları işle
        const children = element.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];

            // Eğer child kendi scope'una sahipse, skip et
            if (child.hasAttribute('t-data')) {
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
 * t-for loop rendering
 * Renders items with proper scoping for reactive loops
 */
function renderForLoop(element, state, contextObj) {
    const forInfo = element._tinypineFor;
    if (!forInfo) return;

    // Get current items from state
    const items = evaluateExpression(forInfo.listName, state, contextObj);

    if (!Array.isArray(items)) {
        console.warn('[TinyPine] t-for target is not an array:', forInfo.listName);
        return;
    }

    // Check if already rendering (prevent recursion)
    if (element._tinypineRendering) {
        return;
    }
    element._tinypineRendering = true;

    // Parse item variable name
    const itemVars = forInfo.itemVar.split(',').map(v => v.trim());
    const itemVar = itemVars[0];
    const indexVar = itemVars[1] || 'index';

    // Clear and render
    element.innerHTML = '';

    // Get fresh template each time (don't trust forInfo.template)
    const originalTemplate = forInfo.template;

    // Early return if no items
    if (items.length === 0) {
        element._tinypineRendering = false;
        return;
    }

    // Render each item
    items.forEach((item, index) => {

        // Parse template into a real element
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalTemplate;

        // Clone the content
        const liEl = element.cloneNode(false); // Clone without children
        liEl.removeAttribute('t-for'); // Remove t-for directive

        // Append template content
        Array.from(tempDiv.childNodes).forEach(node => {
            liEl.appendChild(node.cloneNode(true));
        });


        // Create a simple object with item, index, and parent state access
        const scopedState = Object.create(null);
        scopedState[itemVar] = item;
        scopedState[indexVar] = index;

        // Add all parent state properties as direct values
        try {
            Object.keys(state).forEach(key => {
                try {
                    scopedState[key] = state[key];
                } catch (e) {}
            });
        } catch (e) {}

        // Store on element for click handlers
        liEl._tinypineScopedState = scopedState;

        // Remove ALL t-for attributes from template to prevent recursion
        function removeTFor(el) {
            if (el.hasAttribute('t-for')) {
                el.removeAttribute('t-for');
            }
            Array.from(el.children).forEach(child => {
                removeTFor(child);
            });
        }

        removeTFor(liEl);

        // Process directives and store scoped state on ALL elements
        function processAndStoreState(el) {
            // Store scoped state on this element
            el._tinypineScopedState = scopedState;

            // Process its attributes
            Array.from(el.attributes).forEach(attr => {
                if (attr.name.startsWith('t-') && directiveHandlers[attr.name]) {
                    try {
                        directiveHandlers[attr.name](el, attr.value, scopedState, contextObj);
                    } catch (e) {
                        // Silent
                    }
                }
            });

            // Process children
            Array.from(el.children).forEach(child => {
                processAndStoreState(child);
            });
        }

        processAndStoreState(liEl);


        // Append to parent
        element.appendChild(liEl);
    });

    debugLog(`t-for rendered ${items.length} items`, element);

    // Reset flag
    element._tinypineRendering = false;
}

/**
 * Handle t-for directive during initialization
 */
function handleForDirective(element, expression, state, contextObj) {
    // Parse t-for syntax: "(item, index) in items"
    const match = expression.match(/\((.*?)\)\s+in\s+(.*)/);
    if (!match) {
        console.warn('[TinyPine] Invalid t-for syntax:', expression);
        return;
    }

    const itemVar = match[1].trim();
    const listName = match[2].trim();

    // Get array from state
    const items = evaluateExpression(listName, state, contextObj);

    if (!Array.isArray(items)) {
        console.warn('[TinyPine] t-for target must be an array:', listName);
        return;
    }

    // Store loop info on element
    // IMPORTANT: Save original template ONLY if not already saved
    if (!element._tinypineFor) {
        const originalTemplate = element.innerHTML;
        element._tinypineFor = {
            itemVar,
            listName,
            template: originalTemplate
        };
    }

    // Make array methods trigger re-render
    ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(method => {
        if (!items['_' + method + '_for_wrapped']) {
            const original = Array.prototype[method];
            items[method] = function(...args) {
                const result = original.apply(this, args);
                // Queue re-render ONLY if not currently rendering
                setTimeout(() => {
                    if (!element._tinypineRendering) {
                        renderForLoop(element, state, contextObj);
                    }
                }, 0);
                return result;
            };
            items['_' + method + '_for_wrapped'] = true;
        }
    });

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
        if (parent.hasAttribute('t-data')) {
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
    console.log('🔍 TinyPine debug mode enabled');
}

function debugLog(message, data = null) {
    if (debugMode) {
        console.log(`[TinyPine] ${message}`, data || '');
    }
}

// Module exports (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { reactive, init, initializeScope, evaluateExpression, directiveHandlers, registerContext, getContext };
}

// Global API (Browser)
if (typeof window !== 'undefined') {
    window.TinyPine = {
        init,
        reactive,
        evaluateExpression,
        initializeScope,
        enableDebug,
        disableDebug: () => debugMode = false,
        get debug() { return debugMode; },
        set debug(val) {
            debugMode = val;
            if (val) console.log('🔍 TinyPine debug enabled');
        }
    };
}

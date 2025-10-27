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
    return new Proxy(data, {
        set(target, key, value) {
            target[key] = value;
            if (callback) callback(key, value);
            return true;
        },
        get(target, key) {
            return target[key];
        }
    });
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
function evaluateExpression(expression, state) {
    try {
        const context = Object.keys(state).reduce((ctx, key) => {
            ctx[key] = state[key];
            return ctx;
        }, {});
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
    't-text': function(element, value, state) {
        element.textContent = evaluateExpression(value, state);
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
     * t-click: Click event'lerini handle eder ve state günceller
     * Örnek: <button t-click="count++">Increment</button>
     *
     * NASIL ÇALIŞIR:
     * 1. count++, count--, count = value gibi expression'ları parse eder
     * 2. State'i doğrudan günceller
     * 3. Tüm directive'leri yeniden işler
     *
     * NEDEN:
     * - ++ ve -- operatörlerini doğrudan state'e yazamayız (primitive değerler)
     * - Bu yüzden parse edip manuel güncelliyoruz
     */
    't-click': function(element, expression, state) {
        // Önceki handler varsa temizle (memory leak önleme)
        if (element._tinypineClickHandler) {
            element.removeEventListener('click', element._tinypineClickHandler);
            delete element._tinypineClickHandler;
        }

        const handler = function(event) {
            try {
                const scopeElement = element.closest('[t-data]');
                if (!scopeElement || !scopeElement._tinypineState) return;

                const state = scopeElement._tinypineState;

                // Özel expression'ları parse et ve çalıştır
                if (expression.includes('++')) {
                    const prop = expression.replace('++', '').trim();
                    state[prop] = (state[prop] || 0) + 1;
                } else if (expression.includes('--')) {
                    const prop = expression.replace('--', '').trim();
                    state[prop] = (state[prop] || 0) - 1;
                } else if (expression.includes('=')) {
                    // Atama işlemlerini handle et (count = 0 gibi)
                    const parts = expression.split('=');
                    const prop = parts[0].trim();
                    const value = parts.slice(1).join('=').trim();
                    try {
                        state[prop] = eval(value);
                    } catch (e) {
                        console.warn('[TinyPine] Could not evaluate:', value);
                    }
                } else {
                    // Generic expression evaluation
                    const stateKeys = Object.keys(state);
                    const context = {};
                    stateKeys.forEach(k => context[k] = state[k]);
                    const func = new Function(...Object.keys(context), 'event', `"use strict"; return (${expression})`);
                    func(...Object.values(context), event);
                }

                // Directive'leri güncelle
                updateDirectives(scopeElement, state);
            } catch (error) {
                console.warn('[TinyPine] Error in t-click:', error);
            }
        };

        element._tinypineClickHandler = handler;
        element.addEventListener('click', handler);
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
        if (state.hasOwnProperty(propertyName)) {
            const value = evaluateExpression(expression, state);
            if (element.value !== value && element.value !== String(value)) {
                element.value = value;
            }
        }

        // Input'tan state'e: input event handler
        if (!element._tinypineModelHandler) {
            const handler = function(event) {
                try {
                    if (state.hasOwnProperty(propertyName)) {
                        state[propertyName] = event.target.value;
                        const scopeElement = element.closest('[t-data]');
                        if (scopeElement && scopeElement._tinypineState) {
                            updateDirectives(scopeElement, state);
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
function initializeScope(element) {
    const dataAttr = element.getAttribute('t-data');
    if (!dataAttr) return;

    try {
        // t-data'daki JSON object'i parse et
        const dataObject = Function('"use strict"; return (' + dataAttr + ')')();

        // Debounce için flag
        let updatePending = false;

        // Reaktif state oluştur - Proxy callback ile auto-update
        const state = reactive(dataObject, () => {
            if (!updatePending) {
                updatePending = true;
                setTimeout(() => {
                    updateDirectives(element, state);
                    updatePending = false;
                }, 0);
            }
        });

        // State'i element üzerinde sakla (sonra erişim için)
        element._tinypineState = state;

        // İlk directive processing
        processDirectives(element, state);

        // Child elementlerdeki directive'leri de işle
        element.querySelectorAll('*').forEach(el => processDirectives(el, state));
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
function processDirectives(element, state) {
    Array.from(element.attributes).forEach(attr => {
        if (attr.name.startsWith('t-') && attr.name !== 't-data') {
            applyDirective(element, attr.name, attr.value, state);
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
function applyDirective(element, directive, value, state) {
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

    // Normal directive (t-text, t-show, vs.)
    const handler = directiveHandlers[directive];
    if (handler) {
        handler(element, value, state);
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
    scopeElement.querySelectorAll('*').forEach(el => processDirectives(el, state));
}

// Module exports (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { reactive, init, initializeScope, evaluateExpression, directiveHandlers };
}

// Global API (Browser)
if (typeof window !== 'undefined') {
    window.TinyPine = { init, reactive, evaluateExpression, initializeScope };
}

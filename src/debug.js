/**
 * TinyPine Debug Utility
 * Logs reactive changes when TinyPine.debug = true
 */

let debugEnabled = false;

/**
 * Debug modunu aç/kapa
 */
export function setDebug(enabled) {
    debugEnabled = enabled;
    if (enabled) {
        console.log('🔍 TinyPine debug mode enabled');
    }
}

/**
 * Debug mesajı loglar
 */
export function debugLog(message, data = null) {
    if (!debugEnabled) return;

    console.log(message, data || '');
}

/**
 * Reactive change loglar
 */
export function logReactiveChange(path, oldValue, newValue) {
    if (!debugEnabled) return;

    console.log(`[TinyPine] ${path} changed:`, oldValue, '→', newValue);
}

/**
 * Context oluşturma logları
 */
export function logContextCreation(context) {
    if (!debugEnabled) return;

    console.log('[TinyPine] Context created:', {
        hasParent: !!context.parent,
        hasRoot: !!context.root,
        element: context.el,
        keys: Object.keys(context.data)
    });
}

/**
 * Directive execution logları
 */
export function logDirective(element, directive, value) {
    if (!debugEnabled) return;

    console.log(`[TinyPine] Directive: ${directive} on`, element, `value: ${value}`);
}

// Global debug function
if (typeof window !== 'undefined') {
    window.TinyPineDebug = {
        enable: () => setDebug(true),
        disable: () => setDebug(false),
        isEnabled: () => debugEnabled
    };
}

export { debugEnabled as isDebugEnabled };


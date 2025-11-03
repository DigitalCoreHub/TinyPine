/**
 * TinyPine Context Manager
 * Manages hierarchical scopes with $parent, $root, $refs, $el
 */

import { reactive } from "./core.js";
import { debugLog } from "./debug.js";

/**
 * Context objesi - Her t-data element'i için oluşturulur
 */
function createContext(element, data, parentContext) {
    const context = {
        el: element,
        data: null,
        parent: parentContext,
        root: parentContext ? parentContext.root : null,
        refs: {},
        methods: {},
    };

    // Root context ise, kendisini root olarak işaretle
    if (!parentContext) {
        context.root = context;
    }

    // Data objesini parse et
    const dataObject = typeof data === "string" ? parseDataString(data) : data;

    // Methods'u data'dan ayır
    if (dataObject.methods) {
        context.methods = dataObject.methods;
        delete dataObject.methods;
    }

    // Reactive state oluştur
    context.data = reactive(dataObject, (key, value) => {
        debugLog(`[Context] ${key} changed → ${value}`);
    });

    // $parent, $root, $refs, $el erişimini proxy ile ekle
    addContextAccessors(context);

    return context;
}

/**
 * Context'e $parent, $root, $refs, $el erişimi ekler
 */
function addContextAccessors(context) {
    const originalData = context.data;

    // Proxy ile context accessor'ları ekle
    context.data = new Proxy(originalData, {
        get(target, prop) {
            // Context erişim özellikleri
            if (prop === "$parent") {
                return context.parent ? context.parent.data : null;
            }
            if (prop === "$root") {
                return context.root ? context.root.data : context.data;
            }
            if (prop === "$refs") {
                return context.refs;
            }
            if (prop === "$el") {
                return context.el;
            }

            // Normal property access
            return target[prop];
        },
        set(target, prop, value) {
            target[prop] = value;
            return true;
        },
    });
}

/**
 * t-data string'ini parse eder
 */
function parseDataString(dataAttr) {
    try {
        return Function('"use strict"; return (' + dataAttr + ")")();
    } catch (error) {
        console.warn("[TinyPine] Failed to parse t-data:", dataAttr, error);
        return {};
    }
}

/**
 * Global context store - Tüm context'leri tutar
 */
const contextStore = new WeakMap();

/**
 * Context'i kaydeder
 */
export function registerContext(element, context) {
    contextStore.set(element, context);
}

/**
 * Context'i alır
 */
export function getContext(element) {
    return contextStore.get(element);
}

/**
 * Yeni context oluşturur ve register eder
 */
export function initializeContext(element, dataString, parentElement) {
    const parentContext = parentElement ? getContext(parentElement) : null;
    const context = createContext(element, dataString, parentContext);
    registerContext(element, context);

    return context;
}

// Export default
export default {
    createContext,
    registerContext,
    getContext,
    initializeContext,
};

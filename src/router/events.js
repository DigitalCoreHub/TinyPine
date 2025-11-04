/**
 * TinyPine.js v1.5.0 - Router Events
 * Event emitter for route lifecycle events
 */

/**
 * Router event emitter
 * Manages route:change, route:enter, route:leave, route:error events
 */
export class RouterEvents {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * Register event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event handler to remove
     */
    off(event, callback) {
        if (!this.listeners.has(event)) return;

        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    }

    /**
     * Emit event to all listeners
     * @param {string} event - Event name
     * @param  {...any} args - Arguments to pass to handlers
     */
    emit(event, ...args) {
        if (!this.listeners.has(event)) return;

        const callbacks = this.listeners.get(event);
        callbacks.forEach((callback) => {
            try {
                callback(...args);
            } catch (error) {
                console.error(`[TinyPine][Router] Error in ${event} handler:`, error);
            }
        });
    }

    /**
     * Register listener that runs only once
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     */
    once(event, callback) {
        const wrappedCallback = (...args) => {
            callback(...args);
            this.off(event, wrappedCallback);
        };
        this.on(event, wrappedCallback);
    }

    /**
     * Remove all listeners for an event or all events
     * @param {string} event - Event name (optional)
     */
    clear(event) {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }
}

/**
 * Route lifecycle event types
 */
export const RouteEvents = {
    CHANGE: 'route:change',
    ENTER: 'route:enter',
    LEAVE: 'route:leave',
    ERROR: 'route:error',
    BEFORE_ENTER: 'route:before-enter',
    BEFORE_LEAVE: 'route:before-leave'
};

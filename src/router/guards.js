/**
 * TinyPine.js v1.5.0 - Route Guards
 * Navigation guards with async support
 */

/**
 * Route guard manager
 * Handles beforeEnter and beforeLeave guards with async support
 */
export class RouteGuards {
    constructor() {
        this.globalBeforeEnter = null;
        this.globalBeforeLeave = null;
        this.routeGuards = new Map();
    }

    /**
     * Register global beforeEnter guard
     * @param {Function} guard - Guard function (to, from) => boolean|string|Promise
     */
    setGlobalBeforeEnter(guard) {
        this.globalBeforeEnter = guard;
    }

    /**
     * Register global beforeLeave guard
     * @param {Function} guard - Guard function (to, from) => boolean|string|Promise
     */
    setGlobalBeforeLeave(guard) {
        this.globalBeforeLeave = guard;
    }

    /**
     * Register route-specific guard
     * @param {string} pattern - Route pattern
     * @param {Object} guards - { beforeEnter, beforeLeave }
     */
    setRouteGuards(pattern, guards) {
        this.routeGuards.set(pattern, guards);
    }

    /**
     * Execute beforeEnter guards
     * @param {Object} to - Destination route
     * @param {Object} from - Current route
     * @returns {Promise<boolean|string>} - true to continue, false to cancel, string to redirect
     */
    async runBeforeEnter(to, from) {
        try {
            // Run global beforeEnter
            if (this.globalBeforeEnter) {
                const result = await this.globalBeforeEnter(to, from);
                if (result === false) return false;
                if (typeof result === 'string') return result; // Redirect
            }

            // Run route-specific beforeEnter
            if (to.pattern) {
                const guards = this.routeGuards.get(to.pattern);
                if (guards && guards.beforeEnter) {
                    const result = await guards.beforeEnter(to, from);
                    if (result === false) return false;
                    if (typeof result === 'string') return result; // Redirect
                }
            }

            return true; // Allow navigation
        } catch (error) {
            console.error('[TinyPine][Router] Guard error:', error);
            return false; // Cancel navigation on error
        }
    }

    /**
     * Execute beforeLeave guards
     * @param {Object} to - Destination route
     * @param {Object} from - Current route
     * @returns {Promise<boolean|string>} - true to continue, false to cancel, string to redirect
     */
    async runBeforeLeave(to, from) {
        try {
            // Run global beforeLeave
            if (this.globalBeforeLeave) {
                const result = await this.globalBeforeLeave(to, from);
                if (result === false) return false;
                if (typeof result === 'string') return result; // Redirect
            }

            // Run route-specific beforeLeave
            if (from.pattern) {
                const guards = this.routeGuards.get(from.pattern);
                if (guards && guards.beforeLeave) {
                    const result = await guards.beforeLeave(to, from);
                    if (result === false) return false;
                    if (typeof result === 'string') return result; // Redirect
                }
            }

            return true; // Allow navigation
        } catch (error) {
            console.error('[TinyPine][Router] Guard error:', error);
            return false; // Cancel navigation on error
        }
    }

    /**
     * Clear all guards
     */
    clear() {
        this.globalBeforeEnter = null;
        this.globalBeforeLeave = null;
        this.routeGuards.clear();
    }
}

/**
 * TinyPine.js v1.5.0 - Router Core
 * Smart routing engine with guards, params, and nested routes
 */

import { parseRoutePath, matchRoute, parseQueryString, extractPathFromHash, buildPath, normalizeHash, scrollToTop } from './utils.js';
import { RouterEvents, RouteEvents } from './events.js';
import { RouteGuards } from './guards.js';

/**
 * TinyPine Router Core
 * Manages hash-based routing with dynamic params, guards, and events
 */
export class TinyPineRouter {
    constructor(config = {}) {
        this.routes = new Map(); // pattern -> routeInfo
        this.currentRoute = null;
        this.previousRoute = null;
        this.events = new RouterEvents();
        this.guards = new RouteGuards();
        this.defaultRoute = config.default || 'home';
        this.scrollBehavior = config.scrollBehavior || 'auto'; // 'auto', 'smooth', 'none'
        this.isNavigating = false;
        this.fallbackRoute = null; // 404 handler

        // Register onChange callback if provided
        if (config.onChange) {
            this.events.on(RouteEvents.CHANGE, config.onChange);
        }

        // Register guards if provided
        if (config.beforeEnter) {
            this.guards.setGlobalBeforeEnter(config.beforeEnter);
        }
        if (config.beforeLeave) {
            this.guards.setGlobalBeforeLeave(config.beforeLeave);
        }

        // Register routes if provided
        if (config.routes) {
            Object.keys(config.routes).forEach((pattern) => {
                this.addRoute(pattern, config.routes[pattern]);
            });
        }

        // Setup hashchange listener
        this._setupHashListener();

        // Initialize current route
        this._initializeRoute();
    }

    /**
     * Add a new route
     * @param {string} pattern - Route pattern (e.g., "user/:id")
     * @param {Object} config - Route configuration { beforeEnter, beforeLeave, component, ... }
     */
    addRoute(pattern, config = {}) {
        const routeInfo = parseRoutePath(pattern);
        routeInfo.config = config;

        if (pattern === '*' || routeInfo.isWildcard) {
            this.fallbackRoute = routeInfo;
        } else {
            this.routes.set(pattern, routeInfo);
        }

        // Register route-specific guards
        if (config.beforeEnter || config.beforeLeave) {
            this.guards.setRouteGuards(pattern, {
                beforeEnter: config.beforeEnter,
                beforeLeave: config.beforeLeave
            });
        }
    }

    /**
     * Navigate to a route
     * @param {string} path - Route path or pattern
     * @param {Object} options - { params, query, replace }
     * @returns {Promise<boolean>} - Navigation success
     */
    async push(path, options = {}) {
        const { params = {}, query = {}, replace = false } = options;

        // Build complete path with params and query
        const fullPath = buildPath(path, params, query);

        // Normalize hash
        const hash = normalizeHash(fullPath);

        // Check if already on this route
        if (window.location.hash === hash) {
            return true;
        }

        // Update URL
        if (replace) {
            window.location.replace(hash);
        } else {
            window.location.hash = hash;
        }

        return true;
    }

    /**
     * Navigate and replace current history entry
     * @param {string} path - Route path
     * @param {Object} options - { params, query }
     * @returns {Promise<boolean>} - Navigation success
     */
    async replace(path, options = {}) {
        return this.push(path, { ...options, replace: true });
    }

    /**
     * Go back in history
     */
    back() {
        window.history.back();
    }

    /**
     * Go forward in history
     */
    forward() {
        window.history.forward();
    }

    /**
     * Get current route information
     * @returns {Object} - { path, params, query, pattern }
     */
    current() {
        return this.currentRoute ? { ...this.currentRoute } : null;
    }

    /**
     * Register event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     */
    on(event, callback) {
        this.events.on(event, callback);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     */
    off(event, callback) {
        this.events.off(event, callback);
    }

    /**
     * Setup hashchange event listener
     * @private
     */
    _setupHashListener() {
        window.addEventListener('hashchange', async () => {
            await this._handleRouteChange();
        });
    }

    /**
     * Initialize route on first load
     * @private
     */
    _initializeRoute() {
        if (window.location.hash) {
            // Use current hash
            this._handleRouteChange();
        } else {
            // Navigate to default route
            this.push(this.defaultRoute);
        }
    }

    /**
     * Handle route change
     * @private
     */
    async _handleRouteChange() {
        if (this.isNavigating) return; // Prevent race conditions
        this.isNavigating = true;

        try {
            const hash = window.location.hash || '#/';
            const path = extractPathFromHash(hash);
            const query = parseQueryString(hash);

            // Find matching route
            const matchResult = this._findMatchingRoute(path);

            if (!matchResult && !this.fallbackRoute) {
                console.warn('[TinyPine][Router] No route matched:', path);
                this.isNavigating = false;
                return;
            }

            // Build route objects for guards and events
            const toRoute = {
                path,
                params: matchResult?.params || {},
                query,
                pattern: matchResult?.pattern || '*',
                hash
            };

            const fromRoute = this.currentRoute || {
                path: '',
                params: {},
                query: {},
                pattern: null,
                hash: ''
            };

            // Run beforeLeave guards
            this.events.emit(RouteEvents.BEFORE_LEAVE, toRoute, fromRoute);
            const beforeLeaveResult = await this.guards.runBeforeLeave(toRoute, fromRoute);

            if (beforeLeaveResult === false) {
                // Cancel navigation
                console.log('[TinyPine][Router] Navigation cancelled by beforeLeave guard');
                this.isNavigating = false;
                // Restore previous hash
                if (fromRoute.hash) {
                    window.location.hash = fromRoute.hash;
                }
                return;
            } else if (typeof beforeLeaveResult === 'string') {
                // Redirect to different route
                this.isNavigating = false;
                await this.push(beforeLeaveResult);
                return;
            }

            // Run beforeEnter guards
            this.events.emit(RouteEvents.BEFORE_ENTER, toRoute, fromRoute);
            const beforeEnterResult = await this.guards.runBeforeEnter(toRoute, fromRoute);

            if (beforeEnterResult === false) {
                // Cancel navigation
                console.log('[TinyPine][Router] Navigation cancelled by beforeEnter guard');
                this.isNavigating = false;
                // Restore previous hash
                if (fromRoute.hash) {
                    window.location.hash = fromRoute.hash;
                }
                return;
            } else if (typeof beforeEnterResult === 'string') {
                // Redirect to different route
                this.isNavigating = false;
                await this.push(beforeEnterResult);
                return;
            }

            // Navigation allowed - emit leave event
            this.events.emit(RouteEvents.LEAVE, fromRoute, toRoute);

            // Update current route
            this.previousRoute = this.currentRoute;
            this.currentRoute = toRoute;

            // Emit change and enter events
            this.events.emit(RouteEvents.CHANGE, toRoute, fromRoute);
            this.events.emit(RouteEvents.ENTER, toRoute, fromRoute);

            // Handle scroll behavior
            if (this.scrollBehavior !== 'none') {
                scrollToTop(this.scrollBehavior === 'smooth');
            }

        } catch (error) {
            console.error('[TinyPine][Router] Route change error:', error);
            this.events.emit(RouteEvents.ERROR, error);
        } finally {
            this.isNavigating = false;
        }
    }

    /**
     * Find matching route for path
     * @private
     * @param {string} path - Current path
     * @returns {Object|null} - { pattern, params, routeInfo }
     */
    _findMatchingRoute(path) {
        // Try to match each registered route
        for (const [pattern, routeInfo] of this.routes) {
            const matchResult = matchRoute(path, routeInfo);
            if (matchResult && matchResult.matched) {
                return {
                    pattern,
                    params: matchResult.params,
                    routeInfo
                };
            }
        }

        // No match found - use fallback if available
        if (this.fallbackRoute) {
            return {
                pattern: '*',
                params: {},
                routeInfo: this.fallbackRoute
            };
        }

        return null;
    }

    /**
     * Destroy router and cleanup
     */
    destroy() {
        this.events.clear();
        this.guards.clear();
        this.routes.clear();
    }
}

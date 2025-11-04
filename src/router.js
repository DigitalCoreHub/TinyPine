/**
 * TinyPine.js v1.5.0 - Router Integration
 * Integrates the new router system with TinyPine core
 */

import {
    TinyPineRouter,
    setupTLink,
    parseRoutePath,
    matchRoute,
    extractPathFromHash,
} from "./router/index.js";

/**
 * Initialize TinyPine Router v1.5.0
 * This replaces and enhances the basic router in core.js
 */
export function initializeRouter(TinyPine, debugMode = false) {
    // Router instance
    let routerInstance = null;

    /**
     * Enhanced router() function - v1.5.0
     * @param {Object} config - Router configuration
     * @returns {Object} - TinyPine instance for chaining
     */
    TinyPine.router = function (config = {}) {
        if (TinyPine._mode === "lite") {
            return TinyPine;
        }

        // Create new router instance
        routerInstance = new TinyPineRouter(config);

        // Update _routerState for backwards compatibility
        TinyPine._routerState = {
            currentRoute: routerInstance.currentRoute?.path || "",
            currentParams: routerInstance.currentRoute?.params || {},
            routes: new Map(),
            guards: new Map(),
            fallbackRoute: null,
        };

        // Listen to router events and update state
        routerInstance.on("route:change", (to, from) => {
            TinyPine._routerState.currentRoute = to.path;
            TinyPine._routerState.currentParams = to.params;

            // Update all t-route elements
            updateRouteElements(to.path, to.params);

            // Update all t-link elements
            updateAllLinks();

            if (debugMode) {
                console.log(
                    "[TinyPine][Router v1.5.0] Route changed:",
                    to.path
                );
            }
        });

        // Handle navigation errors
        routerInstance.on("route:error", (error) => {
            console.error("[TinyPine][Router v1.5.0] Navigation error:", error);
        });

        if (debugMode) {
            console.log("[TinyPine][Router v1.5.0] Initialized");
        }

        return TinyPine;
    };

    /**
     * Router helper methods - Available on TinyPine.router
     */

    // Navigate to route
    TinyPine.router.push = function (path, options) {
        if (routerInstance) {
            return routerInstance.push(path, options);
        } else {
            // Fallback to basic navigation
            window.location.hash = "#/" + path.replace(/^\//, "");
            return Promise.resolve(true);
        }
    };

    // Navigate and replace
    TinyPine.router.replace = function (path, options) {
        if (routerInstance) {
            return routerInstance.replace(path, options);
        } else {
            window.location.replace("#/" + path.replace(/^\//, ""));
            return Promise.resolve(true);
        }
    };

    // Go back
    TinyPine.router.back = function () {
        if (routerInstance) {
            return routerInstance.back();
        } else {
            window.history.back();
        }
    };

    // Go forward
    TinyPine.router.forward = function () {
        if (routerInstance) {
            return routerInstance.forward();
        } else {
            window.history.forward();
        }
    };

    // Get current route
    TinyPine.router.current = function () {
        if (routerInstance) {
            return routerInstance.current();
        } else {
            const hash = window.location.hash.replace("#/", "");
            return {
                path: hash || "home",
                params: {},
                query: {},
            };
        }
    };

    // Get current route (alias)
    TinyPine.router.getCurrent = function () {
        const route = TinyPine.router.current();
        return route ? route.path : "home";
    };

    // Navigate (alias for push)
    TinyPine.router.navigate = TinyPine.router.push;

    // Register event listener
    TinyPine.router.on = function (event, callback) {
        if (routerInstance) {
            routerInstance.on(event, callback);
        }
    };

    // Remove event listener
    TinyPine.router.off = function (event, callback) {
        if (routerInstance) {
            routerInstance.off(event, callback);
        }
    };

    /**
     * Update all t-route elements based on current route
     * @param {string} currentPath - Current route path
     * @param {Object} params - Route parameters
     */
    function updateRouteElements(currentPath, params) {
        if (!TinyPine.routeElements) return;

        TinyPine.routeElements.forEach((item) => {
            const { element, routeName } = item;

            // Check if route matches
            let isMatch = false;

            if (routeName === "*") {
                // Wildcard - only show if no other route matched
                isMatch = !TinyPine.routeElements.some((otherItem) => {
                    if (otherItem === item || otherItem.routeName === "*")
                        return false;
                    const otherRouteInfo = parseRoutePath(otherItem.routeName);
                    const otherMatch = matchRoute(currentPath, otherRouteInfo);
                    return otherMatch && otherMatch.matched;
                });
            } else {
                // Try to match route
                const routeInfo = parseRoutePath(routeName);
                const matchResult = matchRoute(currentPath, routeInfo);
                isMatch = matchResult && matchResult.matched;

                // Inject params into element if matched
                if (isMatch && element._tinypineState) {
                    element._tinypineState.$route = {
                        path: currentPath,
                        params: matchResult.params,
                    };
                }
            }

            // Show/hide element
            if (isMatch) {
                element.style.display = "";
            } else {
                element.style.display = "none";
            }
        });
    }

    /**
     * Update all t-link elements active state
     */
    function updateAllLinks() {
        const links = document.querySelectorAll("[t-link]");
        links.forEach((link) => {
            const href = link.getAttribute("href");
            if (href) {
                updateLinkActiveState(link, href);
            }
        });
    }

    /**
     * Update link active state
     * @param {HTMLElement} element - Link element
     * @param {string} href - Link href
     */
    function updateLinkActiveState(element, href) {
        const currentHash = window.location.hash || "#/";
        const currentPath = extractPathFromHash(currentHash);
        const linkPath = extractPathFromHash(href);

        const isActive =
            currentPath === linkPath || currentPath.startsWith(linkPath + "/");

        if (isActive) {
            element.classList.add("active");
            element.setAttribute("aria-current", "page");
        } else {
            element.classList.remove("active");
            element.removeAttribute("aria-current");
        }
    }

    /**
     * Setup t-link directive handler
     */
    TinyPine._setupTLinkDirective = function (
        element,
        path,
        state,
        contextObj
    ) {
        setupTLink(element, path, state, contextObj, routerInstance);
    };

    /**
     * Get router instance (for advanced usage)
     */
    TinyPine.getRouterInstance = function () {
        return routerInstance;
    };

    if (debugMode) {
        console.log("[TinyPine][Router v1.5.0] Router integration initialized");
    }
}

/**
 * Auto-initialize if TinyPine is available
 */
if (typeof window !== "undefined" && window.TinyPine) {
    initializeRouter(window.TinyPine, window.TinyPine.debug);
}

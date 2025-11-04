/**
 * TinyPine.js v1.5.0 - t-link Directive
 * Smart link directive for router-aware navigation with active state
 */

import { extractPathFromHash, isSameRoute } from "./utils.js";

/**
 * Setup t-link directive
 * Automatically adds href, handles click events, and manages active state
 * @param {HTMLElement} element - Link element
 * @param {string} path - Route path
 * @param {Object} state - Component state
 * @param {Object} contextObj - Component context
 * @param {Object} router - Router instance
 */
export function setupTLink(element, path, state, contextObj, router) {
    // Evaluate path expression
    const evaluatedPath =
        typeof path === "string" && path.startsWith("'")
            ? path.slice(1, -1)
            : path;

    // Set href attribute
    const href = `#/${evaluatedPath.replace(/^\//, "")}`;
    element.setAttribute("href", href);

    // Add click handler for programmatic navigation
    const clickHandler = (e) => {
        e.preventDefault();
        if (router && router.push) {
            router.push(evaluatedPath);
        } else {
            window.location.hash = href;
        }
    };

    // Remove old listener if exists
    if (element._tinypineLinkHandler) {
        element.removeEventListener("click", element._tinypineLinkHandler);
    }

    element.addEventListener("click", clickHandler);
    element._tinypineLinkHandler = clickHandler;

    // Update active state
    updateActiveLinkState(element, href);

    // Listen for route changes to update active state
    const routeChangeHandler = () => {
        updateActiveLinkState(element, href);
    };

    if (router && router.on) {
        // Remove old listener if exists
        if (element._tinypineRouteHandler) {
            router.off("route:change", element._tinypineRouteHandler);
        }
        router.on("route:change", routeChangeHandler);
        element._tinypineRouteHandler = routeChangeHandler;
    }
}

/**
 * Update active state of link based on current route
 * @param {HTMLElement} element - Link element
 * @param {string} href - Link href
 */
export function updateActiveLinkState(element, href) {
    const currentHash = window.location.hash || "#/";

    // Extract paths for comparison
    const currentPath = extractPathFromHash(currentHash);
    const linkPath = extractPathFromHash(href);

    // Check if active
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
 * Cleanup t-link directive
 * @param {HTMLElement} element - Link element
 * @param {Object} router - Router instance
 */
export function cleanupTLink(element, router) {
    if (element._tinypineLinkHandler) {
        element.removeEventListener("click", element._tinypineLinkHandler);
        delete element._tinypineLinkHandler;
    }

    if (element._tinypineRouteHandler && router && router.off) {
        router.off("route:change", element._tinypineRouteHandler);
        delete element._tinypineRouteHandler;
    }

    element.classList.remove("active");
    element.removeAttribute("aria-current");
}

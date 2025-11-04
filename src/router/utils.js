/**
 * TinyPine.js v1.5.0 - Router Utilities
 * Path parser, parameter extractor, and query string handler
 */

/**
 * Parse route path and extract parameter names
 * @param {string} pattern - Route pattern (e.g., "user/:id/posts/:postId")
 * @returns {Object} - { segments, paramNames, regex }
 */
export function parseRoutePath(pattern) {
    if (!pattern || pattern === "*") {
        return { segments: [], paramNames: [], regex: null, isWildcard: true };
    }

    // Normalize path - remove leading/trailing slashes
    pattern = pattern.replace(/^\/+|\/+$/g, "");

    const segments = pattern.split("/");
    const paramNames = [];
    const regexParts = [];

    segments.forEach((segment) => {
        if (segment.startsWith(":")) {
            // Dynamic parameter
            const paramName = segment.substring(1);
            paramNames.push(paramName);
            regexParts.push("([^/]+)"); // Match any characters except /
        } else {
            // Static segment
            regexParts.push(segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")); // Escape special chars
        }
    });

    const regexString = "^" + regexParts.join("/") + "$";
    const regex = new RegExp(regexString);

    return {
        segments,
        paramNames,
        regex,
        isWildcard: false,
        pattern,
    };
}

/**
 * Match a path against a route pattern and extract parameters
 * @param {string} path - Current path (e.g., "user/42/posts/10")
 * @param {Object} routeInfo - Parsed route info from parseRoutePath
 * @returns {Object|null} - { matched: true, params: {...} } or null
 */
export function matchRoute(path, routeInfo) {
    if (routeInfo.isWildcard) {
        return { matched: true, params: {}, isWildcard: true };
    }

    // Normalize path
    path = path.replace(/^\/+|\/+$/g, "");

    const match = path.match(routeInfo.regex);
    if (!match) {
        return null;
    }

    // Extract parameters
    const params = {};
    routeInfo.paramNames.forEach((name, index) => {
        params[name] = match[index + 1]; // match[0] is the full match
    });

    return { matched: true, params };
}

/**
 * Parse query string from URL
 * @param {string} url - Full URL or hash (e.g., "#/user/42?tab=posts&page=1")
 * @returns {Object} - Query parameters as key-value pairs
 */
export function parseQueryString(url) {
    const queryIndex = url.indexOf("?");
    if (queryIndex === -1) {
        return {};
    }

    const queryString = url.substring(queryIndex + 1);
    const params = {};

    queryString.split("&").forEach((pair) => {
        const [key, value] = pair.split("=");
        if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(value || "");
        }
    });

    return params;
}

/**
 * Build URL with parameters
 * @param {string} pattern - Route pattern (e.g., "user/:id")
 * @param {Object} params - Parameters to fill in
 * @param {Object} query - Query parameters
 * @returns {string} - Complete URL path
 */
export function buildPath(pattern, params = {}, query = {}) {
    let path = pattern;

    // Replace dynamic parameters
    Object.keys(params).forEach((key) => {
        path = path.replace(`:${key}`, encodeURIComponent(params[key]));
    });

    // Add query parameters
    const queryKeys = Object.keys(query);
    if (queryKeys.length > 0) {
        const queryString = queryKeys
            .map(
                (key) =>
                    `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`
            )
            .join("&");
        path += "?" + queryString;
    }

    return path;
}

/**
 * Normalize hash - ensure it starts with #/
 * @param {string} hash - Hash string
 * @returns {string} - Normalized hash
 */
export function normalizeHash(hash) {
    if (!hash) return "#/";

    hash = hash.trim();

    // Remove leading #
    if (hash.startsWith("#")) {
        hash = hash.substring(1);
    }

    // Ensure leading /
    if (!hash.startsWith("/")) {
        hash = "/" + hash;
    }

    return "#" + hash;
}

/**
 * Extract path from hash (without query string)
 * @param {string} hash - Hash string (e.g., "#/user/42?tab=posts")
 * @returns {string} - Path without query (e.g., "user/42")
 */
export function extractPathFromHash(hash) {
    // Remove #/ prefix
    let path = hash.replace(/^#\/?/, "");

    // Remove query string
    const queryIndex = path.indexOf("?");
    if (queryIndex !== -1) {
        path = path.substring(0, queryIndex);
    }

    // Remove trailing slash
    path = path.replace(/\/$/, "");

    return path || "home";
}

/**
 * Check if two routes are the same
 * @param {string} route1 - First route
 * @param {string} route2 - Second route
 * @returns {boolean} - True if routes match
 */
export function isSameRoute(route1, route2) {
    const path1 = extractPathFromHash(route1);
    const path2 = extractPathFromHash(route2);
    return path1 === path2;
}

/**
 * Scroll to top of page (useful after navigation)
 * @param {boolean} smooth - Use smooth scrolling
 */
export function scrollToTop(smooth = false) {
    if (smooth) {
        window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
        window.scrollTo(0, 0);
    }
}

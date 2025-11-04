/**
 * TinyPine.js v1.5.0 - Router Utils Tests
 * Tests for path parser, parameter extractor, and query handler
 */

import { describe, it, expect } from 'vitest';
import {
    parseRoutePath,
    matchRoute,
    parseQueryString,
    buildPath,
    extractPathFromHash,
    normalizeHash,
    isSameRoute
} from '../../src/router/utils.js';

describe('Router Utils - parseRoutePath', () => {
    it('should parse simple static route', () => {
        const result = parseRoutePath('home');
        expect(result.segments).toEqual(['home']);
        expect(result.paramNames).toEqual([]);
        expect(result.isWildcard).toBe(false);
    });

    it('should parse route with single parameter', () => {
        const result = parseRoutePath('user/:id');
        expect(result.segments).toEqual(['user', ':id']);
        expect(result.paramNames).toEqual(['id']);
        expect(result.isWildcard).toBe(false);
    });

    it('should parse route with multiple parameters', () => {
        const result = parseRoutePath('user/:userId/post/:postId');
        expect(result.segments).toEqual(['user', ':userId', 'post', ':postId']);
        expect(result.paramNames).toEqual(['userId', 'postId']);
        expect(result.isWildcard).toBe(false);
    });

    it('should handle wildcard route', () => {
        const result = parseRoutePath('*');
        expect(result.isWildcard).toBe(true);
    });

    it('should handle routes with leading/trailing slashes', () => {
        const result = parseRoutePath('/user/:id/');
        expect(result.segments).toEqual(['user', ':id']);
        expect(result.paramNames).toEqual(['id']);
    });
});

describe('Router Utils - matchRoute', () => {
    it('should match static route', () => {
        const routeInfo = parseRoutePath('home');
        const result = matchRoute('home', routeInfo);
        expect(result.matched).toBe(true);
        expect(result.params).toEqual({});
    });

    it('should not match different static route', () => {
        const routeInfo = parseRoutePath('home');
        const result = matchRoute('about', routeInfo);
        expect(result).toBeNull();
    });

    it('should match route with parameters', () => {
        const routeInfo = parseRoutePath('user/:id');
        const result = matchRoute('user/42', routeInfo);
        expect(result.matched).toBe(true);
        expect(result.params).toEqual({ id: '42' });
    });

    it('should match route with multiple parameters', () => {
        const routeInfo = parseRoutePath('user/:userId/post/:postId');
        const result = matchRoute('user/123/post/456', routeInfo);
        expect(result.matched).toBe(true);
        expect(result.params).toEqual({ userId: '123', postId: '456' });
    });

    it('should match wildcard route', () => {
        const routeInfo = parseRoutePath('*');
        const result = matchRoute('anything/goes/here', routeInfo);
        expect(result.matched).toBe(true);
        expect(result.isWildcard).toBe(true);
    });

    it('should not match route with wrong segment count', () => {
        const routeInfo = parseRoutePath('user/:id');
        const result = matchRoute('user/42/extra', routeInfo);
        expect(result).toBeNull();
    });
});

describe('Router Utils - parseQueryString', () => {
    it('should parse simple query string', () => {
        const result = parseQueryString('#/user?id=42');
        expect(result).toEqual({ id: '42' });
    });

    it('should parse multiple query parameters', () => {
        const result = parseQueryString('#/search?q=test&page=2&limit=10');
        expect(result).toEqual({ q: 'test', page: '2', limit: '10' });
    });

    it('should handle URL with no query string', () => {
        const result = parseQueryString('#/home');
        expect(result).toEqual({});
    });

    it('should decode URI components', () => {
        const result = parseQueryString('#/search?q=hello%20world');
        expect(result).toEqual({ q: 'hello world' });
    });

    it('should handle empty values', () => {
        const result = parseQueryString('#/search?q=&page=1');
        expect(result).toEqual({ q: '', page: '1' });
    });
});

describe('Router Utils - buildPath', () => {
    it('should build path without parameters', () => {
        const result = buildPath('home');
        expect(result).toBe('home');
    });

    it('should build path with parameters', () => {
        const result = buildPath('user/:id', { id: '42' });
        expect(result).toBe('user/42');
    });

    it('should build path with multiple parameters', () => {
        const result = buildPath('user/:userId/post/:postId', { userId: '123', postId: '456' });
        expect(result).toBe('user/123/post/456');
    });

    it('should add query parameters', () => {
        const result = buildPath('search', {}, { q: 'test', page: '1' });
        expect(result).toBe('search?q=test&page=1');
    });

    it('should combine path params and query params', () => {
        const result = buildPath('user/:id', { id: '42' }, { tab: 'posts' });
        expect(result).toBe('user/42?tab=posts');
    });

    it('should encode special characters', () => {
        const result = buildPath('search', {}, { q: 'hello world' });
        expect(result).toBe('search?q=hello%20world');
    });
});

describe('Router Utils - extractPathFromHash', () => {
    it('should extract path from hash', () => {
        const result = extractPathFromHash('#/user/42');
        expect(result).toBe('user/42');
    });

    it('should extract path without query string', () => {
        const result = extractPathFromHash('#/user/42?tab=posts');
        expect(result).toBe('user/42');
    });

    it('should handle hash without leading slash', () => {
        const result = extractPathFromHash('#user/42');
        expect(result).toBe('user/42');
    });

    it('should return home for empty hash', () => {
        const result = extractPathFromHash('#/');
        expect(result).toBe('home');
    });

    it('should remove trailing slash', () => {
        const result = extractPathFromHash('#/about/');
        expect(result).toBe('about');
    });
});

describe('Router Utils - normalizeHash', () => {
    it('should add #/ prefix', () => {
        const result = normalizeHash('home');
        expect(result).toBe('#/home');
    });

    it('should handle existing # prefix', () => {
        const result = normalizeHash('#home');
        expect(result).toBe('#/home');
    });

    it('should handle existing #/ prefix', () => {
        const result = normalizeHash('#/home');
        expect(result).toBe('#/home');
    });

    it('should handle empty string', () => {
        const result = normalizeHash('');
        expect(result).toBe('#/');
    });

    it('should add leading slash when needed', () => {
        const result = normalizeHash('user/42');
        expect(result).toBe('#/user/42');
    });
});

describe('Router Utils - isSameRoute', () => {
    it('should match identical routes', () => {
        const result = isSameRoute('#/home', '#/home');
        expect(result).toBe(true);
    });

    it('should match routes ignoring query strings', () => {
        const result = isSameRoute('#/user/42?tab=posts', '#/user/42?tab=profile');
        expect(result).toBe(true);
    });

    it('should not match different routes', () => {
        const result = isSameRoute('#/home', '#/about');
        expect(result).toBe(false);
    });

    it('should handle routes with/without hash prefix', () => {
        const result = isSameRoute('home', '#/home');
        expect(result).toBe(true);
    });
});

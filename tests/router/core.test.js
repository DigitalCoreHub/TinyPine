/**
 * TinyPine.js v1.5.0 - Router Core Tests
 * Tests for the main routing engine with guards and events
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { TinyPineRouter } from '../../src/router/core.js';

describe('Router Core - Basic Navigation', () => {
    let router;
    let dom;

    beforeEach(() => {
        // Setup DOM
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: 'http://localhost/'
        });
        global.window = dom.window;
        global.document = dom.window.document;
        global.location = dom.window.location;
        global.history = dom.window.history;

        // Create router
        router = new TinyPineRouter({ default: 'home' });
    });

    it('should initialize with default route', () => {
        expect(router.defaultRoute).toBe('home');
        expect(router.currentRoute).toBeTruthy();
    });

    it('should add routes', () => {
        router.addRoute('about', {});
        router.addRoute('user/:id', {});

        expect(router.routes.size).toBeGreaterThan(0);
    });

    it('should navigate using push', async () => {
        router.addRoute('about', {});
        await router.push('about');

        expect(window.location.hash).toBe('#/about');
    });

    it('should navigate using replace', async () => {
        router.addRoute('about', {});
        await router.replace('about');

        expect(window.location.hash).toBe('#/about');
    });

    it('should navigate with parameters', async () => {
        router.addRoute('user/:id', {});
        await router.push('user/:id', { params: { id: '42' } });

        expect(window.location.hash).toContain('user/42');
    });

    it('should navigate with query parameters', async () => {
        router.addRoute('search', {});
        await router.push('search', { query: { q: 'test', page: '1' } });

        expect(window.location.hash).toContain('search?q=test&page=1');
    });

    it('should get current route', () => {
        router.addRoute('home', {});
        const current = router.current();

        expect(current).toBeTruthy();
        expect(current.path).toBeDefined();
    });
});

describe('Router Core - Route Guards', () => {
    let router;
    let dom;

    beforeEach(() => {
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: 'http://localhost/'
        });
        global.window = dom.window;
        global.document = dom.window.document;
        global.location = dom.window.location;
        global.history = dom.window.history;
    });

    it('should call beforeEnter guard', async () => {
        const beforeEnter = vi.fn(() => true);

        router = new TinyPineRouter({
            beforeEnter,
            default: 'home'
        });

        router.addRoute('about', {});
        await router.push('about');

        // Wait for async guards
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(beforeEnter).toHaveBeenCalled();
    });

    it('should block navigation when guard returns false', async () => {
        const beforeEnter = vi.fn(() => false);

        router = new TinyPineRouter({
            beforeEnter,
            default: 'home'
        });

        router.addRoute('protected', {});
        const initialHash = window.location.hash;

        await router.push('protected');
        await new Promise(resolve => setTimeout(resolve, 100));

        // Should stay on initial route
        expect(window.location.hash).toBe(initialHash);
    });

    it('should redirect when guard returns string', async () => {
        const beforeEnter = vi.fn(() => '/login');

        router = new TinyPineRouter({
            beforeEnter,
            default: 'home'
        });

        router.addRoute('protected', {});
        router.addRoute('login', {});

        await router.push('protected');
        await new Promise(resolve => setTimeout(resolve, 200));

        expect(window.location.hash).toContain('login');
    });

    it('should call route-specific beforeEnter', async () => {
        const routeGuard = vi.fn(() => true);

        router = new TinyPineRouter({ default: 'home' });
        router.addRoute('admin', { beforeEnter: routeGuard });

        await router.push('admin');
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(routeGuard).toHaveBeenCalled();
    });
});

describe('Router Core - Events', () => {
    let router;
    let dom;

    beforeEach(() => {
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: 'http://localhost/'
        });
        global.window = dom.window;
        global.document = dom.window.document;
        global.location = dom.window.location;
        global.history = dom.window.history;

        router = new TinyPineRouter({ default: 'home' });
    });

    it('should emit route:change event', async () => {
        const onChange = vi.fn();
        router.on('route:change', onChange);

        router.addRoute('about', {});
        await router.push('about');

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(onChange).toHaveBeenCalled();
    });

    it('should emit route:enter event', async () => {
        const onEnter = vi.fn();
        router.on('route:enter', onEnter);

        router.addRoute('about', {});
        await router.push('about');

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(onEnter).toHaveBeenCalled();
    });

    it('should emit route:leave event', async () => {
        const onLeave = vi.fn();
        router.on('route:leave', onLeave);

        router.addRoute('home', {});
        router.addRoute('about', {});

        await router.push('home');
        await new Promise(resolve => setTimeout(resolve, 100));

        await router.push('about');
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(onLeave).toHaveBeenCalled();
    });

    it('should remove event listener with off', () => {
        const onChange = vi.fn();
        router.on('route:change', onChange);
        router.off('route:change', onChange);

        router.addRoute('about', {});
        router.push('about');

        expect(onChange).not.toHaveBeenCalled();
    });
});

describe('Router Core - Fallback Route (404)', () => {
    let router;
    let dom;

    beforeEach(() => {
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: 'http://localhost/'
        });
        global.window = dom.window;
        global.document = dom.window.document;
        global.location = dom.window.location;
        global.history = dom.window.history;

        router = new TinyPineRouter({ default: 'home' });
    });

    it('should register wildcard route as fallback', () => {
        router.addRoute('*', {});
        expect(router.fallbackRoute).toBeTruthy();
    });

    it('should match fallback when no route matches', () => {
        router.addRoute('home', {});
        router.addRoute('about', {});
        router.addRoute('*', {});

        const result = router._findMatchingRoute('nonexistent');
        expect(result.pattern).toBe('*');
    });
});

describe('Router Core - History Navigation', () => {
    let router;
    let dom;

    beforeEach(() => {
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: 'http://localhost/'
        });
        global.window = dom.window;
        global.document = dom.window.document;
        global.location = dom.window.location;
        global.history = dom.window.history;

        router = new TinyPineRouter({ default: 'home' });
    });

    it('should call window.history.back', () => {
        const backSpy = vi.spyOn(window.history, 'back');
        router.back();
        expect(backSpy).toHaveBeenCalled();
    });

    it('should call window.history.forward', () => {
        const forwardSpy = vi.spyOn(window.history, 'forward');
        router.forward();
        expect(forwardSpy).toHaveBeenCalled();
    });
});

describe('Router Core - Cleanup', () => {
    let router;
    let dom;

    beforeEach(() => {
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: 'http://localhost/'
        });
        global.window = dom.window;
        global.document = dom.window.document;
        global.location = dom.window.location;
        global.history = dom.window.history;

        router = new TinyPineRouter({ default: 'home' });
    });

    it('should cleanup on destroy', () => {
        router.addRoute('home', {});
        router.addRoute('about', {});

        router.destroy();

        expect(router.routes.size).toBe(0);
    });
});

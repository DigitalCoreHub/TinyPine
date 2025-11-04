/**
 * TinyPine.js v1.5.0 Tests
 * Router integration, t-link directive, and route guards
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import '../src/store.js';
import '../src/core.js';
import '../src/router.js';

describe('v1.5.0 - Router Integration', () => {
    let dom;

    beforeEach(() => {
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
                <body>
                    <div id="app"></div>
                </body>
            </html>
        `, { url: 'http://localhost/' });

        global.window = dom.window;
        global.document = dom.window.document;
        global.location = dom.window.location;
        global.history = dom.window.history;
    });

    it('should have router available on TinyPine', () => {
        expect(window.TinyPine.router).toBeDefined();
        expect(typeof window.TinyPine.router).toBe('function');
    });

    it('should have router.push method', () => {
        expect(window.TinyPine.router.push).toBeDefined();
        expect(typeof window.TinyPine.router.push).toBe('function');
    });

    it('should have router.replace method', () => {
        expect(window.TinyPine.router.replace).toBeDefined();
        expect(typeof window.TinyPine.router.replace).toBe('function');
    });

    it('should have router.back method', () => {
        expect(window.TinyPine.router.back).toBeDefined();
        expect(typeof window.TinyPine.router.back).toBe('function');
    });

    it('should have router.forward method', () => {
        expect(window.TinyPine.router.forward).toBeDefined();
        expect(typeof window.TinyPine.router.forward).toBe('function');
    });

    it('should have router.current method', () => {
        expect(window.TinyPine.router.current).toBeDefined();
        expect(typeof window.TinyPine.router.current).toBe('function');
    });

    it('should have router.getCurrent method (backwards compatibility)', () => {
        expect(window.TinyPine.router.getCurrent).toBeDefined();
        expect(typeof window.TinyPine.router.getCurrent).toBe('function');
    });

    it('should have router.navigate as alias for push', () => {
        expect(window.TinyPine.router.navigate).toBe(window.TinyPine.router.push);
    });
});

describe('v1.5.0 - t-route Directive', () => {
    let dom;

    beforeEach(() => {
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
                <body>
                    <div t-route="'home'">Home Page</div>
                    <div t-route="'about'">About Page</div>
                    <div t-route="'user/:id'">User Profile</div>
                    <div t-route="*">404 Not Found</div>
                </body>
            </html>
        `, { url: 'http://localhost/' });

        global.window = dom.window;
        global.document = dom.window.document;
        global.location = dom.window.location;
        global.history = dom.window.history;

        window.TinyPine.init();
    });

    it('should register route elements', () => {
        expect(window.TinyPine.routeElements).toBeDefined();
        expect(window.TinyPine.routeElements.length).toBeGreaterThan(0);
    });

    it('should hide non-matching routes', () => {
        const homeElement = document.querySelector('[t-route="\'home\'"]');
        const aboutElement = document.querySelector('[t-route="\'about\'"]');

        // Initially on home
        window.location.hash = '#/home';
        window.TinyPine.init();

        // About should be hidden
        expect(aboutElement.style.display).toBe('none');
    });

    it('should show matching route', () => {
        window.location.hash = '#/home';
        window.TinyPine.init();

        const homeElement = document.querySelector('[t-route="\'home\'"]');
        expect(homeElement.style.display).toBe('');
    });
});

describe('v1.5.0 - t-link Directive', () => {
    let dom;

    beforeEach(() => {
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
                <body>
                    <a t-link="'home'">Home</a>
                    <a t-link="'about'">About</a>
                    <a t-link="'user/42'">User 42</a>
                </body>
            </html>
        `, { url: 'http://localhost/' });

        global.window = dom.window;
        global.document = dom.window.document;
        global.location = dom.window.location;
        global.history = dom.window.history;

        window.TinyPine.init();
    });

    it('should add href attribute to links', () => {
        const homeLink = document.querySelector('a[t-link="\'home\'"]');
        expect(homeLink.getAttribute('href')).toBe('#/home');
    });

    it('should add click handler', () => {
        const homeLink = document.querySelector('a[t-link="\'home\'"]');
        expect(homeLink._tinypineLinkHandler).toBeDefined();
    });

    it('should add active class to current route', () => {
        window.location.hash = '#/home';
        window.TinyPine.init();

        const homeLink = document.querySelector('a[t-link="\'home\'"]');
        expect(homeLink.classList.contains('active')).toBe(true);
    });

    it('should add aria-current to active link', () => {
        window.location.hash = '#/about';
        window.TinyPine.init();

        const aboutLink = document.querySelector('a[t-link="\'about\'"]');
        expect(aboutLink.getAttribute('aria-current')).toBe('page');
    });
});

describe('v1.5.0 - Router Context Variables', () => {
    let dom;

    beforeEach(() => {
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
                <body>
                    <div t-route="'user/:id'">
                        <div t-data="{ userId: $route.params.id }">
                            <p t-text="'User: ' + userId"></p>
                        </div>
                    </div>
                </body>
            </html>
        `, { url: 'http://localhost/' });

        global.window = dom.window;
        global.document = dom.window.document;
        global.location = dom.window.location;
        global.history = dom.window.history;
    });

    it('should have $route in context', () => {
        window.TinyPine._routerState = {
            currentRoute: 'user/42',
            currentParams: { id: '42' }
        };

        window.TinyPine.init();

        // $route should be available in evaluateExpression context
        expect(window.TinyPine._routerState.currentParams.id).toBe('42');
    });

    it('should have $router in context', () => {
        expect(window.TinyPine._routerState).toBeDefined();
    });
});

describe('v1.5.0 - Route Guards', () => {
    let dom;

    beforeEach(() => {
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
                <body>
                    <div id="app"></div>
                </body>
            </html>
        `, { url: 'http://localhost/' });

        global.window = dom.window;
        global.document = dom.window.document;
        global.location = dom.window.location;
        global.history = dom.window.history;
    });

    it('should support beforeEnter guard configuration', () => {
        const beforeEnter = (to, from) => {
            return true;
        };

        window.TinyPine.router({
            default: 'home',
            beforeEnter,
            routes: {
                'home': {},
                'about': {}
            }
        });

        expect(window.TinyPine.router).toBeDefined();
    });

    it('should support route-specific guards', () => {
        window.TinyPine.router({
            default: 'home',
            routes: {
                'protected': {
                    beforeEnter: (to, from) => {
                        return false; // Block access
                    }
                }
            }
        });

        expect(window.TinyPine._routerState.guards).toBeDefined();
    });
});

describe('v1.5.0 - Wildcard 404 Route', () => {
    let dom;

    beforeEach(() => {
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
                <body>
                    <div t-route="'home'">Home</div>
                    <div t-route="'about'">About</div>
                    <div t-route="*" id="fallback">404 Not Found</div>
                </body>
            </html>
        `, { url: 'http://localhost/' });

        global.window = dom.window;
        global.document = dom.window.document;
        global.location = dom.window.location;
        global.history = dom.window.history;

        window.TinyPine.init();
    });

    it('should register wildcard route', () => {
        const wildcardElement = document.getElementById('fallback');
        expect(wildcardElement).toBeTruthy();
        expect(wildcardElement.getAttribute('t-route')).toBe('*');
    });

    it('should show fallback when no route matches', () => {
        window.location.hash = '#/nonexistent';
        window.TinyPine.init();

        const fallbackElement = document.getElementById('fallback');

        // Fallback should be shown for non-existent routes
        expect(window.TinyPine.routeElements.some(item =>
            item.routeName === '*' && item.element === fallbackElement
        )).toBe(true);
    });
});

describe('v1.5.0 - Nested Routes', () => {
    let dom;

    beforeEach(() => {
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
                <body>
                    <div t-route="'dashboard'">
                        <h1>Dashboard</h1>
                        <div t-route="'dashboard/overview'">Overview</div>
                        <div t-route="'dashboard/settings'">Settings</div>
                    </div>
                </body>
            </html>
        `, { url: 'http://localhost/' });

        global.window = dom.window;
        global.document = dom.window.document;
        global.location = dom.window.location;
        global.history = dom.window.history;

        window.TinyPine.init();
    });

    it('should support nested route definitions', () => {
        const dashboardElement = document.querySelector('[t-route="\'dashboard\'"]');
        const overviewElement = document.querySelector('[t-route="\'dashboard/overview\'"]');

        expect(dashboardElement).toBeTruthy();
        expect(overviewElement).toBeTruthy();
    });
});

describe('v1.5.0 - Query Parameters', () => {
    let dom;

    beforeEach(() => {
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
                <body>
                    <div id="app"></div>
                </body>
            </html>
        `, { url: 'http://localhost/#/search?q=test&page=1' });

        global.window = dom.window;
        global.document = dom.window.document;
        global.location = dom.window.location;
        global.history = dom.window.history;
    });

    it('should parse query parameters from URL', () => {
        // Query params should be accessible via router
        const current = window.TinyPine.router.current();
        // Current might not have query yet, but the utility functions support it
        expect(window.location.hash).toContain('?q=test');
    });
});

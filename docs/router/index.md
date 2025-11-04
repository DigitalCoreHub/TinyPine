# TinyPine Router v1.5.0

**Smart client-side routing with navigation guards, dynamic params, and programmatic control.**

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [Route Directives](#route-directives)
- [Programmatic Navigation](#programmatic-navigation)
- [Route Guards](#route-guards)
- [Lifecycle Events](#lifecycle-events)
- [Advanced Usage](#advanced-usage)

---

## Quick Start

### Basic Router Setup

```html
<!DOCTYPE html>
<html>
<head>
    <title>My SPA</title>
</head>
<body>
    <!-- Navigation Links -->
    <nav>
        <a t-link="'home'">Home</a>
        <a t-link="'about'">About</a>
        <a t-link="'user/42'">User Profile</a>
    </nav>

    <!-- Route Views -->
    <div t-route="'home'">
        <h1>Welcome Home!</h1>
    </div>

    <div t-route="'about'">
        <h1>About Us</h1>
    </div>

    <div t-route="'user/:id'">
        <div t-data="{ userId: $route.params.id }">
            <h1 t-text="'User Profile: ' + userId"></h1>
        </div>
    </div>

    <!-- 404 Fallback -->
    <div t-route="*">
        <h1>404 - Page Not Found</h1>
    </div>

    <script src="https://unpkg.com/tinypine@1.5.0/dist/tinypine.min.js"></script>
    <script>
        TinyPine.router({
            default: 'home'
        });
        TinyPine.init();
    </script>
</body>
</html>
```

---

## Core Concepts

### Hash-Based Routing

TinyPine uses hash-based routing (`#/path`) for client-side navigation without page reloads.

**URL Structure:**
```
http://example.com/#/user/42?tab=posts
                    │  └─────┘ └────────┘
                    │    │         │
                    │  path   query params
                 hash prefix
```

### Route Patterns

| Pattern | Example URL | Matches | Params |
|---------|-------------|---------|--------|
| `home` | `#/home` | Exact match | - |
| `user/:id` | `#/user/42` | Dynamic param | `{ id: '42' }` |
| `post/:postId/comment/:id` | `#/post/10/comment/5` | Multiple params | `{ postId: '10', id: '5' }` |
| `*` | `#/anything` | Wildcard (404) | - |

---

## Route Directives

### t-route

Shows element only when the route matches.

**Basic Usage:**
```html
<div t-route="'home'">
    <h1>Home Page</h1>
</div>
```

**With Dynamic Parameters:**
```html
<div t-route="'user/:id'">
    <div t-data="{}">
        <p t-text="$route.params.id"></p>
    </div>
</div>
```

**Nested Routes:**
```html
<div t-route="'dashboard'">
    <h1>Dashboard</h1>

    <nav>
        <a t-link="'dashboard/overview'">Overview</a>
        <a t-link="'dashboard/settings'">Settings</a>
    </nav>

    <div t-route="'dashboard/overview'">
        <p>Overview content...</p>
    </div>

    <div t-route="'dashboard/settings'">
        <p>Settings content...</p>
    </div>
</div>
```

**404 Fallback:**
```html
<div t-route="*">
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
</div>
```

### t-link

Smart router link that automatically manages `href`, click events, and active state.

**Basic Usage:**
```html
<a t-link="'home'">Home</a>
<a t-link="'about'">About</a>
```

**With Dynamic Params:**
```html
<div t-data="{ userId: 42 }">
    <a t-link="'user/' + userId">View Profile</a>
</div>
```

**Active State:**
```css
/* Links automatically get .active class when route matches */
a.active {
    color: blue;
    font-weight: bold;
}
```

---

## Programmatic Navigation

### $router API

Available in all t-data contexts and globally on `TinyPine.router`.

#### push(path, options)

Navigate to a new route.

```javascript
// Simple navigation
$router.push('/about');

// With parameters
$router.push('/user/:id', { params: { id: '42' } });

// With query parameters
$router.push('/search', { query: { q: 'test', page: '1' } });

// Combined
$router.push('/user/:id', {
    params: { id: '42' },
    query: { tab: 'posts' }
});
```

#### replace(path, options)

Navigate without adding to history.

```javascript
$router.replace('/login');
```

#### back()

Go back one step in history.

```javascript
$router.back();
```

#### forward()

Go forward one step in history.

```javascript
$router.forward();
```

#### current()

Get current route information.

```javascript
const route = $router.current();
console.log(route.path);    // 'user/42'
console.log(route.params);  // { id: '42' }
console.log(route.query);   // { tab: 'posts' }
```

### $route Object

Available in all t-data contexts.

```javascript
{
    path: 'user/42',
    params: { id: '42' },
    query: { tab: 'posts' },
    pattern: 'user/:id',
    hash: '#/user/42?tab=posts'
}
```

**Example:**
```html
<div t-route="'user/:id'">
    <div t-data="{}">
        <h1 t-text="'User ID: ' + $route.params.id"></h1>
        <p t-text="'Current tab: ' + $route.query.tab"></p>
    </div>
</div>
```

---

## Route Guards

### Global Guards

Control navigation across all routes.

**beforeEnter:**
```javascript
TinyPine.router({
    beforeEnter(to, from) {
        // Check authentication
        const isLoggedIn = TinyPine.store('auth').loggedIn;

        if (!isLoggedIn && to.path !== 'login') {
            return '/login'; // Redirect to login
        }

        return true; // Allow navigation
    }
});
```

**beforeLeave:**
```javascript
TinyPine.router({
    beforeLeave(to, from) {
        // Confirm leaving unsaved changes
        if (hasUnsavedChanges) {
            const confirmed = confirm('You have unsaved changes. Leave anyway?');
            return confirmed; // true = allow, false = cancel
        }
        return true;
    }
});
```

### Route-Specific Guards

Apply guards to individual routes.

```javascript
TinyPine.router({
    routes: {
        'admin': {
            beforeEnter(to, from) {
                const isAdmin = TinyPine.store('user').role === 'admin';
                return isAdmin ? true : '/';
            }
        },
        'edit/:id': {
            beforeLeave(to, from) {
                return confirm('Discard changes?');
            }
        }
    }
});
```

### Async Guards

Guards can be async for API calls.

```javascript
TinyPine.router({
    async beforeEnter(to, from) {
        try {
            const response = await fetch('/api/verify-token');
            const { valid } = await response.json();

            return valid ? true : '/login';
        } catch (error) {
            console.error('Auth check failed:', error);
            return '/login';
        }
    }
});
```

### Guard Return Values

| Return Value | Effect |
|--------------|--------|
| `true` | Allow navigation |
| `false` | Cancel navigation |
| `'/path'` | Redirect to path |
| `Promise` | Wait for async result |

---

## Lifecycle Events

Listen to route changes across your application.

### Event Types

```javascript
// Route is about to change (before guards)
TinyPine.router.on('route:before-enter', (to, from) => {
    console.log('Navigating to:', to.path);
});

// Route has changed (after guards)
TinyPine.router.on('route:change', (to, from) => {
    console.log('Route changed from', from.path, 'to', to.path);
});

// Entering new route
TinyPine.router.on('route:enter', (to, from) => {
    console.log('Entered:', to.path);
});

// Leaving current route
TinyPine.router.on('route:leave', (from, to) => {
    console.log('Left:', from.path);
});

// Navigation error
TinyPine.router.on('route:error', (error) => {
    console.error('Navigation error:', error);
});
```

### Practical Examples

**Page Analytics:**
```javascript
TinyPine.router.on('route:change', (to, from) => {
    // Track page views
    if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID', {
            page_path: to.path
        });
    }
});
```

**Loading Indicators:**
```javascript
TinyPine.router.on('route:before-enter', () => {
    document.body.classList.add('loading');
});

TinyPine.router.on('route:enter', () => {
    document.body.classList.remove('loading');
});
```

**Scroll Management:**
```javascript
TinyPine.router.on('route:enter', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
```

---

## Advanced Usage

### Query Parameters

```html
<!-- In template -->
<div t-data="{}">
    <button t-click="$router.push('/search', { query: { q: searchQuery } })">
        Search
    </button>
</div>

<!-- Access in route -->
<div t-route="'search'">
    <div t-data="{}">
        <p t-text="'Searching for: ' + $route.query.q"></p>
    </div>
</div>
```

### Scroll Behavior

Configure scroll behavior on route change.

```javascript
TinyPine.router({
    scrollBehavior: 'smooth' // 'auto', 'smooth', or 'none'
});
```

### Multiple Routers

TinyPine supports a single global router instance, but you can manage different route sets:

```javascript
TinyPine.router({
    routes: {
        // Public routes
        'home': {},
        'about': {},
        'contact': {},

        // Auth routes
        'login': {},
        'register': {},

        // Protected routes
        'dashboard': {
            beforeEnter: requireAuth
        },
        'profile': {
            beforeEnter: requireAuth
        }
    }
});
```

### Integration with Store

```javascript
// Setup router with store integration
TinyPine.store('router', {
    currentPath: 'home',
    previousPath: null
});

TinyPine.router.on('route:change', (to, from) => {
    TinyPine.store('router').currentPath = to.path;
    TinyPine.store('router').previousPath = from.path;
});

// Use in templates
<div t-data="{}">
    <p t-text="$store.router.currentPath"></p>
</div>
```

---

## Best Practices

### 1. Use Route Guards for Auth

```javascript
TinyPine.router({
    beforeEnter(to, from) {
        const publicRoutes = ['home', 'about', 'login'];
        const isPublic = publicRoutes.includes(to.path);
        const isLoggedIn = TinyPine.store('auth').loggedIn;

        if (!isPublic && !isLoggedIn) {
            return '/login';
        }
        return true;
    }
});
```

### 2. Centralize Route Definitions

```javascript
const routes = {
    'home': { title: 'Home' },
    'about': { title: 'About' },
    'user/:id': {
        title: 'User Profile',
        beforeEnter(to) {
            // Validate user ID
            return /^\d+$/.test(to.params.id);
        }
    }
};

TinyPine.router({ routes, default: 'home' });
```

### 3. Handle 404s Gracefully

```html
<div t-route="*">
    <h1>Oops! Page not found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a t-link="'home'">Go back home</a>
</div>
```

### 4. Use Semantic Paths

```
✅ Good:
/user/42
/post/10/edit
/dashboard/settings

❌ Bad:
/u/42
/p10e
/dash-set
```

---

## Next Steps

- [t-route Directive Reference](./t-route.md)
- [t-link Directive Reference](./t-link.md)
- [Router Guards Guide](./router-guards.md)
- [Programmatic Navigation](./programmatic-navigation.md)
- [404 Handling](./404-handling.md)

---

<div align="center">

**TinyPine Router v1.5.0**
Navigate like a pro — with guards, params, and full control.

[GitHub](https://github.com/DigitalCoreHub/TinyPine) · [Documentation](../README.md)

</div>

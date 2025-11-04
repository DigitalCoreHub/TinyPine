# t-route Directive

Show/hide elements based on the current route.

---

## Basic Usage

```html
<div t-route="'home'">
    <h1>Home Page</h1>
</div>

<div t-route="'about'">
    <h1>About Page</h1>
</div>
```

---

## Dynamic Parameters

Extract parameters from the URL:

```html
<div t-route="'user/:id'">
    <div t-data="{}">
        <!-- Access params via $route.params -->
        <h1 t-text="'User ID: ' + $route.params.id"></h1>
    </div>
</div>

<!-- URL: #/user/42 → Shows "User ID: 42" -->
```

### Multiple Parameters

```html
<div t-route="'blog/:category/:postId'">
    <div t-data="{}">
        <h2 t-text="$route.params.category"></h2>
        <p t-text="'Post #' + $route.params.postId"></p>
    </div>
</div>

<!-- URL: #/blog/tech/123 → category=tech, postId=123 -->
```

---

## Nested Routes

Create hierarchical navigation:

```html
<div t-route="'dashboard'">
    <h1>Dashboard</h1>

    <nav>
        <a t-link="'dashboard/overview'">Overview</a>
        <a t-link="'dashboard/stats'">Stats</a>
        <a t-link="'dashboard/settings'">Settings</a>
    </nav>

    <div t-route="'dashboard/overview'">
        <h2>Overview</h2>
        <p>Dashboard overview content...</p>
    </div>

    <div t-route="'dashboard/stats'">
        <h2>Statistics</h2>
        <p>Charts and graphs here...</p>
    </div>

    <div t-route="'dashboard/settings'">
        <h2>Settings</h2>
        <form>...</form>
    </div>
</div>
```

---

## Wildcard (404) Route

Catch all unmatched routes:

```html
<!-- Specific routes -->
<div t-route="'home'">Home</div>
<div t-route="'about'">About</div>
<div t-route="'contact'">Contact</div>

<!-- Fallback for everything else -->
<div t-route="*">
    <h1>404 - Page Not Found</h1>
    <p>Sorry, this page doesn't exist.</p>
    <a t-link="'home'">Go Home</a>
</div>
```

---

## Accessing Route Data

### $route.params

URL parameters extracted from the pattern:

```html
<div t-route="'product/:category/:id'">
    <div t-data="{}">
        <h1 t-text="$route.params.category"></h1>
        <p t-text="'Product ID: ' + $route.params.id"></p>
    </div>
</div>
```

### $route.query

Query string parameters:

```html
<div t-route="'search'">
    <div t-data="{}">
        <!-- URL: #/search?q=laptop&sort=price -->
        <p t-text="'Searching for: ' + $route.query.q"></p>
        <p t-text="'Sort by: ' + $route.query.sort"></p>
    </div>
</div>
```

### $route.path

Current path:

```html
<div t-data="{}">
    <p t-text="'Current route: ' + $route.path"></p>
</div>
```

---

## Advanced Patterns

### Complex Parameters

```html
<!-- UUID patterns -->
<div t-route="'item/:uuid'">
    <!-- URL: #/item/a1b2c3d4-e5f6-7890 -->
</div>

<!-- Slug patterns -->
<div t-route="'post/:slug'">
    <!-- URL: #/post/hello-world-from-tinypine -->
</div>
```

### Conditional Rendering

Combine with t-show for complex conditions:

```html
<div t-route="'profile/:username'" t-data="{}">
    <div t-show="$route.params.username === 'admin'">
        <p>Admin controls...</p>
    </div>

    <div t-show="$route.params.username !== 'admin'">
        <p>User profile...</p>
    </div>
</div>
```

---

## Common Patterns

### Layout with Routes

```html
<!-- App Shell -->
<div id="app">
    <header>
        <nav>
            <a t-link="'home'">Home</a>
            <a t-link="'products'">Products</a>
            <a t-link="'about'">About</a>
        </nav>
    </header>

    <main>
        <!-- Route Views -->
        <div t-route="'home'">Home Content</div>
        <div t-route="'products'">Products List</div>
        <div t-route="'product/:id'">Product Detail</div>
        <div t-route="'about'">About Us</div>
        <div t-route="*">404</div>
    </main>

    <footer>© 2025 TinyPine</footer>
</div>
```

### Tabs with Routes

```html
<div t-data="{}">
    <div class="tabs">
        <button t-link="'profile/info'">Info</button>
        <button t-link="'profile/posts'">Posts</button>
        <button t-link="'profile/settings'">Settings</button>
    </div>

    <div class="tab-content">
        <div t-route="'profile/info'">User information...</div>
        <div t-route="'profile/posts'">User posts...</div>
        <div t-route="'profile/settings'">Settings...</div>
    </div>
</div>
```

---

## Best Practices

### 1. Always Define a Fallback

```html
<div t-route="*">
    <h1>404 - Not Found</h1>
</div>
```

### 2. Use Semantic Route Names

```html
✅ Good:
<div t-route="'user/:id'">...</div>
<div t-route="'blog/:slug'">...</div>

❌ Bad:
<div t-route="'u/:i'">...</div>
<div t-route="'b/:s'">...</div>
```

### 3. Keep Routes Flat When Possible

```html
<!-- Simple, flat routes -->
<div t-route="'home'">...</div>
<div t-route="'about'">...</div>
<div t-route="'contact'">...</div>

<!-- Only nest when it makes sense -->
<div t-route="'settings'">
    <div t-route="'settings/profile'">...</div>
    <div t-route="'settings/security'">...</div>
</div>
```

### 4. Validate Parameters

```html
<div t-route="'user/:id'" t-data="{}">
    <div t-show="/^\d+$/.test($route.params.id)">
        <p t-text="'Valid user ID: ' + $route.params.id"></p>
    </div>

    <div t-show="!/^\d+$/.test($route.params.id)">
        <p>Invalid user ID</p>
    </div>
</div>
```

---

## See Also

- [t-link Directive](./t-link.md)
- [Router Guards](./router-guards.md)
- [Programmatic Navigation](./programmatic-navigation.md)

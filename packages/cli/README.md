# 🌲 @tinypine/cli

Official TinyPine CLI - Create, configure, and extend TinyPine projects in seconds!

## Installation

```bash
npx @tinypine/cli new myapp
```

Or install globally:

```bash
npm install -g @tinypine/cli
tinypine new myapp
```

## Commands

### Create New Project

```bash
npx tinypine new myapp
```

Interactive wizard for selecting:

- Project template (Vanilla, Tailwind, SPA, SSR, UI Ready)
- Features (Router, i18n, UI Components, DevTools)

### Add Module

```bash
tinypine add router
tinypine add i18n
tinypine add ui
tinypine add devtools
```

### Start Dev Server

```bash
tinypine serve
# or with options
tinypine serve --port 3000 --open
```

### Build

```bash
tinypine build
```

## Features

- 🚀 **Fast scaffolding** - Create projects in seconds
- 🎨 **Multiple templates** - Choose from Vanilla, Tailwind, SPA, SSR, or UI Ready
- 🔧 **Modular setup** - Add features as you go
- ⚡ **Vite integration** - Lightning-fast dev server
- 🎯 **Zero config** - Works out of the box

## License

MIT

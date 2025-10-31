/**
 * TinyPine.js Build Script
 * Minifies core.js for production using Terser
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

// Read source files
const storeSource = fs.readFileSync('src/store.js', 'utf8');
const coreSource = fs.readFileSync('src/core.js', 'utf8');
const devtoolsSource = fs.readFileSync('src/devtools.js', 'utf8');
const uiSource = fs.readFileSync('src/ui.js', 'utf8');
const cssSource = fs.readFileSync('src/tinypine.ui.css', 'utf8');

// Combine sources
const combinedSource = storeSource + '\n\n' + coreSource + '\n\n' + devtoolsSource;
const uiCombinedSource = storeSource + '\n\n' + coreSource + '\n\n' + uiSource; // UI needs store + core

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Minify with Terser
async function build() {
    // Build main bundle
    const result = await minify(combinedSource, {
        compress: {
            drop_console: false,
            passes: 3
        },
        mangle: {
            toplevel: true
        },
        format: {
            comments: false
        }
    });

    fs.writeFileSync('dist/tinypine.min.js', result.code);

    // Build UI bundle
    const uiResult = await minify(uiCombinedSource, {
        compress: {
            drop_console: false,
            passes: 3
        },
        mangle: {
            toplevel: true
        },
        format: {
            comments: false
        }
    });

    fs.writeFileSync('dist/tinypine.ui.min.js', uiResult.code);

    // Copy CSS (minified)
    const cssMinified = cssSource
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/;\s*}/g, '}') // Remove space before closing brace
        .trim();
    fs.writeFileSync('dist/tinypine.ui.css', cssMinified);

    // Get file sizes
    const mainSize = (fs.statSync('dist/tinypine.min.js').size / 1024).toFixed(2);
    const uiSize = (fs.statSync('dist/tinypine.ui.min.js').size / 1024).toFixed(2);
    const cssSize = (fs.statSync('dist/tinypine.ui.css').size / 1024).toFixed(2);

    console.log('✅ Build complete!');
    console.log(`📦 Output: dist/tinypine.min.js (${mainSize} KB)`);
    console.log(`📦 Output: dist/tinypine.ui.min.js (${uiSize} KB)`);
    console.log(`📦 Output: dist/tinypine.ui.css (${cssSize} KB)`);
}

build().catch(console.error);


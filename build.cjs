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

// Combine sources
const combinedSource = storeSource + '\n\n' + coreSource + '\n\n' + devtoolsSource;

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Minify with Terser
async function build() {
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

    // Get file size
    const size = (fs.statSync('dist/tinypine.min.js').size / 1024).toFixed(2);

    console.log('✅ Build complete!');
    console.log(`📦 Output: dist/tinypine.min.js (${size} KB)`);
}

build().catch(console.error);


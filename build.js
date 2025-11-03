/**
 * TinyPine.js Build Script
 * Minifies core.js for production
 */

const fs = require("fs");
const path = require("path");

// Read source file
const coreSource = fs.readFileSync("src/core.js", "utf8");

// Basic minification (remove comments, whitespace, etc.)
function minify(code) {
    // Remove single-line comments
    let minified = code.replace(/\/\/.*\n/g, "");

    // Remove multi-line comments (not JSDoc)
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, (match) => {
        // Keep JSDoc comments
        if (match.includes("@param") || match.includes("@returns")) {
            return match;
        }
        return "";
    });

    // Remove extra whitespace
    minified = minified.replace(/\n\s*\n/g, "\n");
    minified = minified.replace(/\s{2,}/g, " ");

    // Remove whitespace around certain operators
    minified = minified.replace(/\s*{\s*/g, "{");
    minified = minified.replace(/\s*}\s*/g, "}");
    minified = minified.replace(/\s*\(\s*/g, "(");
    minified = minified.replace(/\s*\)\s*/g, ")");
    minified = minified.replace(/\s*;\s*/g, ";");
    minified = minified.replace(/\s*,\s*/g, ",");
    minified = minified.replace(/\s*=\s*/g, "=");

    return minified.trim();
}

// Create dist directory if it doesn't exist
if (!fs.existsSync("dist")) {
    fs.mkdirSync("dist");
}

// Minify and write to dist
const minified = minify(coreSource);
fs.writeFileSync("dist/tinypine.min.js", minified);

// Get file size
const size = (fs.statSync("dist/tinypine.min.js").size / 1024).toFixed(2);

console.log("✅ Build complete!");
console.log(`📦 Output: dist/tinypine.min.js (${size} KB)`);

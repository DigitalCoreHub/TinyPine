/**
 * TinyPine.js Rollup Configuration
 * Builds ESM, CJS, and IIFE (browser) versions
 */

import { terser } from "@rollup/plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const isProduction = process.env.NODE_ENV === "production";

const outputConfig = {
    format: "iife",
    name: "TinyPine",
    sourcemap: !isProduction,
};

export default [
    // Browser IIFE build (minified)
    {
        input: "src/index.js",
        output: {
            ...outputConfig,
            file: "dist/tinypine.min.js",
        },
        plugins: [
            nodeResolve(),
            commonjs(),
            terser({
                compress: {
                    drop_console: false,
                    passes: 3,
                },
                mangle: {
                    toplevel: true,
                },
                format: {
                    comments: false,
                },
            }),
        ],
    },
];

#!/usr/bin/env node

/**
 * TinyPine CLI v1.1.0
 * Official command-line interface for TinyPine framework
 */

import { program } from "commander";
import chalk from "chalk";
import { newCommand } from "./commands/new.js";
import { addCommand } from "./commands/add.js";
import { serveCommand } from "./commands/serve.js";
import { buildCommand } from "./commands/build.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
    readFileSync(join(__dirname, "../package.json"), "utf-8")
);
const version = packageJson.version;

// CLI Banner
console.log(chalk.cyan("\n🌲  TinyPine CLI v" + version + "\n"));

program
    .name("tinypine")
    .description("Official TinyPine framework CLI")
    .version(version);

// Register commands
newCommand(program);
addCommand(program);
serveCommand(program);
buildCommand(program);

// Parse arguments
program.parse(process.argv);

// If no command provided, show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}

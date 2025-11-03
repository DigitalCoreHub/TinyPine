import chalk from "chalk";
import ora from "ora";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export function buildCommand(program) {
    program
        .command("build")
        .description("Build the project for production")
        .option("-o, --output <dir>", "Output directory", "dist")
        .action(async (options) => {
            const spinner = ora("Building project...").start();

            try {
                spinner.text = "Compiling...";

                // Use Vite for building
                await execAsync(`npx vite build --outDir ${options.output}`, {
                    stdio: "pipe",
                });

                spinner.succeed("Build completed successfully!");
                console.log(
                    chalk.green(
                        `\n✨ Production build ready in ./${options.output}\n`
                    )
                );
            } catch (error) {
                spinner.fail("Build failed");
                console.error(chalk.red(error.message));
                process.exit(1);
            }
        });
}

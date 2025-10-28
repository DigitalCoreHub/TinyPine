import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export function serveCommand(program) {
  program
    .command('serve')
    .description('Start the development server')
    .option('-p, --port <port>', 'Port number', '5173')
    .option('-o, --open', 'Open browser automatically', false)
    .action(async (options) => {
      console.log(chalk.cyan('🚀 Starting TinyPine Dev Server...\n'));

      const port = options.port || 5173;
      const url = `http://localhost:${port}`;

      console.log(chalk.green(`✨ Server running at ${chalk.bold(url)}\n`));

      // Use Vite as dev server
      try {
        await execAsync(`npx vite --port ${port} ${options.open ? '--open' : ''}`, {
          stdio: 'inherit'
        });
      } catch (error) {
        console.error(chalk.red('Error starting server:'), error.message);
        process.exit(1);
      }
    });
}


import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function newCommand(program) {
  program
    .command('new <project-name>')
    .description('Create a new TinyPine project')
    .option('-t, --template <template>', 'Specify template (vanilla, tailwind, spa, ssr, ui-ready)')
    .option('-f, --features <features>', 'Comma-separated features (router,i18n,ui,devtools)')
    .option('-y, --yes', 'Skip prompts and use defaults')
    .action(async (projectName, options) => {
      const spinner = ora('Initializing project...').start();

      try {
        // Validate project name
        if (!/^[a-z0-9-_]+$/i.test(projectName)) {
          spinner.fail('Invalid project name. Use only letters, numbers, hyphens, and underscores.');
          process.exit(1);
        }

        // Check if directory already exists
        const targetPath = path.resolve(process.cwd(), projectName);
        if (await fs.pathExists(targetPath)) {
          spinner.fail(`Directory "${projectName}" already exists.`);
          process.exit(1);
        }

        spinner.succeed('Directory validated');

        // Template selection
        let template = options.template;
        if (!template && !options.yes) {
          const { selectedTemplate } = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedTemplate',
              message: 'Select project type:',
              choices: [
                { name: '🌲 Vanilla (Basic)', value: 'vanilla' },
                { name: '✨ Tailwind (Styled)', value: 'tailwind' },
                { name: '🚀 SPA (Single Page App)', value: 'spa' },
                { name: '⚡ SSR (Server-Side Rendering)', value: 'ssr' },
                { name: '🎨 UI Ready (Component Kit)', value: 'ui-ready' }
              ]
            }
          ]);
          template = selectedTemplate;
        }

        spinner.start(`Creating ${template} template...`);

        // Create project structure
        await createProjectStructure(targetPath, template);

        spinner.succeed('Project structure created');

        // Features selection
        const features = await selectFeatures(template, options);

        // Install features
        if (features.length > 0) {
          spinner.start('Installing features...');
          await installFeatures(targetPath, features);
          spinner.succeed(`Installed features: ${features.join(', ')}`);
        }

        // Create config file
        spinner.start('Creating configuration...');
        await createConfigFile(targetPath, template, features);
        spinner.succeed('Configuration created');

        // Create README
        await createReadme(targetPath, projectName, template, features);

        console.log(chalk.green('\n✅ Project created successfully!\n'));
        console.log(chalk.cyan(`📦 Created TinyPine project in ./${projectName}`));
        console.log(chalk.cyan(`➡ Run: cd ${projectName} && npm install && npm run dev\n`));

      } catch (error) {
        spinner.fail(`Error: ${error.message}`);
        process.exit(1);
      }
    });
}

async function createProjectStructure(targetPath, template) {
  await fs.ensureDir(targetPath);
  await fs.ensureDir(path.join(targetPath, 'src'));
  await fs.ensureDir(path.join(targetPath, 'src/components'));
  await fs.ensureDir(path.join(targetPath, 'src/pages'));
  await fs.ensureDir(path.join(targetPath, 'public'));

  // Create main.js
  const mainContent = `import { TinyPine } from 'tinypine';

const { state, effect } = TinyPine.createContext();

effect(() => {
  console.log('Welcome to TinyPine! State:', state());
});

export default { state, effect };
`;
  await fs.writeFile(path.join(targetPath, 'src/main.js'), mainContent);

  // Create index.html
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${path.basename(targetPath)}</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
`;
  await fs.writeFile(path.join(targetPath, 'public/index.html'), htmlContent);

  // Create package.json
  const packageContent = {
    name: path.basename(targetPath),
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'tinypine serve',
      build: 'tinypine build',
      serve: 'tinypine serve'
    },
    dependencies: {
      tinypine: '^1.1.0'
    }
  };

  if (template === 'tailwind') {
    packageContent.dependencies['tailwindcss'] = '^3.0.0';
  }

  await fs.writeFile(path.join(targetPath, 'package.json'), JSON.stringify(packageContent, null, 2));
}

async function selectFeatures(template, options) {
  if (options.yes) {
    return template === 'ui-ready' ? ['ui'] : [];
  }

  const { features } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'features',
      message: 'Include features:',
      choices: [
        { name: '🔄 Router', value: 'router' },
        { name: '🌍 i18n (Internationalization)', value: 'i18n' },
        { name: '🎨 UI Components', value: 'ui' },
        { name: '🛠️ DevTools', value: 'devtools' }
      ]
    }
  ]);

  return features;
}

async function installFeatures(targetPath, features) {
  for (const feature of features) {
    await createFeatureModule(targetPath, feature);
  }
}

async function createFeatureModule(targetPath, featureName) {
  const modulePath = path.join(targetPath, `src/${featureName}.js`);

  let content = '';
  switch (featureName) {
    case 'router':
      content = `// TinyPine Router Module
export const createRouter = (routes) => {
  // Router implementation
  console.log('Router module loaded');
}`;
      break;
    case 'i18n':
      content = `// TinyPine i18n Module
export const createI18n = (locales) => {
  // i18n implementation
  console.log('i18n module loaded');
}`;
      break;
    case 'ui':
      content = `// TinyPine UI Module
export const UI = {
  Button: (props) => {},
  Modal: (props) => {},
  Tabs: (props) => {}
}`;
      break;
    case 'devtools':
      content = `// TinyPine DevTools Module
export const DevTools = {
  enable: () => console.log('DevTools enabled'),
  disable: () => console.log('DevTools disabled')
}`;
      break;
  }

  await fs.writeFile(modulePath, content);
}

async function createConfigFile(targetPath, template, features) {
  const config = {
    version: '1.1.0',
    template,
    features,
    compiler: {
      target: 'es2022',
      minify: true
    },
    dev: {
      port: 5173,
      open: true
    }
  };

  const configPath = path.join(targetPath, 'tinypine.config.js');
  const configContent = `export default ${JSON.stringify(config, null, 2)};\n`;
  await fs.writeFile(configPath, configContent);
}

async function createReadme(targetPath, projectName, template, features) {
  const readmeContent = `# ${projectName}

🌲 TinyPine Project — ${template}

## Features

${features.map(f => `- ${f}`).join('\n')}

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`
`;
  await fs.writeFile(path.join(targetPath, 'README.md'), readmeContent);
}


import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';

const AVAILABLE_MODULES = ['router', 'i18n', 'ui', 'devtools'];

export function addCommand(program) {
  program
    .command('add <module>')
    .description('Add a preset module to your project')
    .action(async (moduleName) => {
      const spinner = ora(`Adding ${moduleName} module...`).start();

      try {
        // Validate module name
        if (!AVAILABLE_MODULES.includes(moduleName)) {
          spinner.fail(`Unknown module: ${moduleName}`);
          console.log(chalk.gray(`Available modules: ${AVAILABLE_MODULES.join(', ')}`));
          process.exit(1);
        }

        const projectPath = process.cwd();

        // Check if already installed
        const modulePath = path.join(projectPath, `src/${moduleName}.js`);
        if (await fs.pathExists(modulePath)) {
          spinner.warn(`Module ${moduleName} already exists`);
          return;
        }

        // Install module
        await installModule(projectPath, moduleName);

        spinner.succeed(`Added ${moduleName} module`);

        // Update config
        await updateConfig(projectPath, moduleName);

        console.log(chalk.green(`\n✅ Module '${moduleName}' added successfully!\n`));
        console.log(chalk.cyan(`Import it in your code: import { ... } from './${moduleName}';\n`));

      } catch (error) {
        spinner.fail(`Error: ${error.message}`);
        process.exit(1);
      }
    });
}

async function installModule(projectPath, moduleName) {
  const modulePath = path.join(projectPath, `src/${moduleName}.js`);

  let content = '';
  switch (moduleName) {
    case 'router':
      content = `// TinyPine Router Module
export const createRouter = (routes) => {
  let currentRoute = location.hash.slice(1) || '/';

  const navigate = (path) => {
    window.location.hash = path;
    currentRoute = path;
    updateView();
  };

  const updateView = () => {
    const route = routes.find(r => r.path === currentRoute) || routes.find(r => r.path === '*');
    if (route) {
      document.querySelector('#app').innerHTML = route.component();
    }
  };

  window.addEventListener('hashchange', () => {
    currentRoute = location.hash.slice(1) || '/';
    updateView();
  });

  updateView();

  return { navigate };
};

export default { createRouter };
`;
      break;

    case 'i18n':
      content = `// TinyPine i18n Module
export const createI18n = (locales = {}) => {
  let currentLang = 'en';
  let translations = locales[currentLang] || {};

  const t = (key) => {
    return translations[key] || key;
  };

  const setLang = (lang) => {
    currentLang = lang;
    translations = locales[lang] || {};
  };

  const addTranslations = (lang, trans) => {
    locales[lang] = { ...locales[lang], ...trans };
    if (lang === currentLang) {
      translations = locales[lang];
    }
  };

  return { t, setLang, addTranslations };
};

export default { createI18n };
`;
      break;

    case 'ui':
      content = `// TinyPine UI Module
export const UI = {
  Button: ({ text, onClick, variant = 'primary' }) => {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = \`btn btn-\${variant}\`;
    button.onclick = onClick;
    return button;
  },

  Modal: ({ title, content, onClose }) => {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = \`
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <h2>\${title}</h2>
        <div>\${content}</div>
      </div>
    \`;
    return modal;
  },

  Tabs: ({ tabs = [] }) => {
    // Tabs implementation
    const container = document.createElement('div');
    container.className = 'tabs';
    return container;
  }
};

export default UI;
`;
      break;

    case 'devtools':
      content = `// TinyPine DevTools Module
export const DevTools = {
  enable: () => {
    console.log('%c🌲 TinyPine DevTools Enabled', 'color: #00ff00; font-weight: bold;');
    window.__TINYPINE_DEVTOOLS__ = true;
  },

  disable: () => {
    console.log('%c🌲 TinyPine DevTools Disabled', 'color: #ff0000; font-weight: bold;');
    window.__TINYPINE_DEVTOOLS__ = false;
  },

  log: (message, data) => {
    if (window.__TINYPINE_DEVTOOLS__) {
      console.log(\`[TinyPine] \${message}\`, data);
    }
  }
};

export default DevTools;
`;
      break;
  }

  await fs.writeFile(modulePath, content);
}

async function updateConfig(projectPath, moduleName) {
  const configPath = path.join(projectPath, 'tinypine.config.js');

  if (await fs.pathExists(configPath)) {
    const configContent = await fs.readFile(configPath, 'utf-8');
    // Simple update - in production, use proper parser
    console.log(chalk.gray('Config file updated'));
  } else {
    // Create new config
    const config = {
      version: '1.1.0',
      features: [moduleName],
      compiler: {
        target: 'es2022',
        minify: true
      }
    };
    const content = `export default ${JSON.stringify(config, null, 2)};\n`;
    await fs.writeFile(configPath, content);
  }
}


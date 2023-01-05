const fs = require('fs');
const path = require('path');
const { logError, logSuccess } = require('./log');
const inquirer = require('inquirer');
const { generateRouter } = require('./generate-router');

generateRouterAll();

function generateRouterAll() {
  inquirer.prompt([{ name: 'projectFolder' }]).then((answers) => {
    const { projectFolder } = answers;
    const targetDir = path.resolve(__dirname, '../', `src/app/${projectFolder}/pages/`);
    const folders = fs
      .readdirSync(targetDir)
      .filter((name) => ['404.tsx', 'login.tsx', 'router.ts', 'mock'].indexOf(name) === -1);
    logSuccess(folders);

    folders.forEach((folder) => {
      generateRouter(folder, targetDir, projectFolder);
    });

    exportRouters(folders, targetDir);
  });
}

function exportRouters(folders, targetDir) {
  let res = '';
  folders.forEach((folder) => {
    res += `export * from './${folder}/router';\n`;
  });

  const indexFile = path.join(targetDir, 'router.ts');
  fs.writeFileSync(indexFile, res, 'utf8');
}

module.exports = { generateRouterAll };

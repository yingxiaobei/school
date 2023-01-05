const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const { logError, logSuccess, logInfo } = require('./log');
const { generateRouter } = require('./generate-router');

inquirer
  .prompt([{ name: 'projectFolder' }, { name: 'parentFolder' }, { name: 'folder' }])
  .then((answers) => {
    const { projectFolder, parentFolder, folder } = answers;
    const baseSrc = path.resolve(__dirname, '../', `src/app/${projectFolder}/pages/`);

    const isExist = fs.existsSync(path.join(baseSrc, parentFolder));

    const targetFolder = path.join(baseSrc, parentFolder, folder);
    fs.mkdirSync(targetFolder, { recursive: true });

    const componentName = folder.slice(0, 1).toUpperCase() + folder.slice(1);
    const indexFile = path.join(targetFolder, 'index.tsx');
    const indexContent = `export default function ${componentName}() {
  return <div>${componentName}</div>;
}\n`;
    fs.writeFileSync(indexFile, indexContent, 'utf8');

    const apiFile = path.join(targetFolder, '_api.ts');
    const apiContent = `import { request } from 'services';\n`;
    fs.writeFileSync(apiFile, apiContent, 'utf8');

    generateRouter(parentFolder, baseSrc, projectFolder);

    if (!isExist) {
      logInfo('新添加一个大目录，将重新生成所有目录');
      require('./generate-router-all');
    }
  })
  .catch((err) => {
    logError(err);
  });

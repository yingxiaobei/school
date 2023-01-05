const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const { logError, logSuccess } = require('./log');

function generateRouter(folder, baseSrc, projectFolder) {
  const targetDir = path.join(baseSrc, folder);
  const folders = fs.readdirSync(targetDir).filter((name) => ['components'].indexOf(name) === -1);
  let routers = '';

  folders.forEach((subFolder) => {
    // 部分路由早期未拼接上父级路径，需做特殊处理
    const routerWithoutPrefix = ['coach', 'statistics', 'student', 'teach', 'trainingInstitution', 'useCenter'];
    const routerPath = routerWithoutPrefix.indexOf(folder) !== -1 ? subFolder : `${folder}/${subFolder}`;
    const filePath = path.join(targetDir, subFolder);
    const isDirectory = fs.lstatSync(filePath).isDirectory();

    if (isDirectory) {
      const isEmpty = fs.readdirSync(filePath).length === 0;
      if (!isEmpty) {
        logSuccess('添加路由:' + routerPath);
        routers += `  {
    path: '/${routerPath}',
    component: lazy(() => import('app/${projectFolder}/pages/${folder}/${subFolder}')),
  },\n`;
      }
    }
  });

  const dependsCode = `import { lazy } from 'react';\n\n`;

  const content = dependsCode + `export const ${folder} =` + ' [\n' + routers + '];\n';

  const indexFile = path.join(targetDir, 'router.ts');

  fs.writeFileSync(indexFile, content, 'utf8');
}

module.exports = { generateRouter };

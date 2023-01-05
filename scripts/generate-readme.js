const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const content = `
# useAuth

> 判断权限是否存在的工具

## API



### Params

| 参数   | 说明                  | 类型   |
| ------ | --------------------- | ------ |
| authId | 必传值，传入权限 code | string |

### Result

| 参数        | 说明         | 类型    |
| ----------- | ------------ | ------- |
| isExistence | 权限是否存在 | boolean |

`;

function generateREADME() {
  // console.log(chalk.green('__dirname'), __dirname);
  // console.log(chalk.blue('__filename'), __filename);
  // console.log(chalk.yellow('process.cwd()'), process.cwd());
  // console.log(chalk.blue('path.resolve()'), path.resolve('.'));

  // const foo = path.join(__dirname, '..', 'src', 'index.ts');
  // const bar = path.parse(foo);
  // console.log(foo);
  // console.log(path.normalize('/asdf//dds/'));
  // console.log(bar);
  const filePath = path.join(__dirname, '..', 'src', 'hooks', 'useVisible.md');
  fs.writeFileSync(filePath, content, 'utf-8');
}

generateREADME();

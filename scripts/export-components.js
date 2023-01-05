var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

console.log(chalk.yellow('START: 自动导出components/index.ts'));

const res = [];
const componentsDir = path.join(__dirname, '..', 'src', 'components');
const files = fs.readdirSync(componentsDir);
const outputFile = path.join(componentsDir, 'index.ts');

files.forEach((file) => {
  const filename = file.replace(/.tsx/, '');
  if (file !== 'index.ts') {
    res.push(`export { default as ${filename}} from \'./${filename}\'`);
  }
});

fs.writeFileSync(outputFile, res.join(';\n'), 'utf8');
fs.appendFileSync(outputFile, '\n');

console.log(chalk.green('END: 已生成最新components/index.ts'));

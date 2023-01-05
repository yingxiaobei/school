var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

console.log(chalk.yellow('START: 自动导出hooks/index.ts'));

const res = [];
const componentsDir = path.join(__dirname, '..', 'src', 'hooks');
const files = fs.readdirSync(componentsDir);
const outputFile = path.join(componentsDir, 'index.ts');

files.forEach((file) => {
  if (/.ts(x?)$/.test(file) && file !== 'index.ts' && file.startsWith('use')) {
    const filename = file.replace(/.ts(x?)$/, '');
    res.push(`export * from \'./${filename}\'`);
  }
});

fs.writeFileSync(outputFile, res.join(';\n'), 'utf8');
fs.appendFileSync(outputFile, '\n');

console.log(chalk.green('END: 已生成最新hooks/index.ts'));

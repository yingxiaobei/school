const fs = require('fs');
const path = require('path');
const { logInfo, logSuccess } = require('./log');

logInfo('START: 开始生成菜单文件index.json');

const res = { title: '远方学车', category: 'ERP' };
const menus = [];

const menusDir = path.join(__dirname, '..', 'menus');
const files = fs.readdirSync(menusDir);
const outputFile = path.join(__dirname, '..', 'index.json');

files.forEach((file) => {
  const dir = path.join(menusDir, file);
  const menu = JSON.parse(fs.readFileSync(dir, 'utf8'));
  menus.push(...menu);
});
Object.assign(res, { menus });

fs.writeFileSync(outputFile, JSON.stringify(res, null, 2), 'utf8');
fs.appendFileSync(outputFile, '\n');

logSuccess('END: 已生成最新index.json, 请及时发送给相关人员');

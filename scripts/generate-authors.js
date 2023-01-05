const path = require('path');
const fs = require('fs');
const simpleGit = require('simple-git/promise');
const _ = require('lodash');

const cwd = process.cwd();
const git = simpleGit(cwd);

const excludes = [
  '121-tangweikun@users.noreply.192.168.192.10',
  '121-tangweikun@users.noreply.192.168.191.110',
  '230-wangying@users.noreply.192.168.192.10',
];

async function execute() {
  let logs = (await git.log()).all;
  logs = _.remove(logs, ({ author_email: email }) => {
    for (let i = 0; i < excludes.length; i++) {
      const item = excludes[i];
      if (email.indexOf(item) !== -1) {
        return false;
      }
    }
    return true;
  });
  logs = _.sortBy(_.unionBy(logs, 'author_email'), 'author_name');
  fs.writeFileSync(
    path.join(cwd, 'AUTHORS.txt'),
    logs.map((item) => `${item.author_name} <${item.author_email}>`).join('\n'),
  );
}

execute();

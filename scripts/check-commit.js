/* eslint-disable import/no-dynamic-require, no-console */
const chalk = require('chalk');
const path = require('path');
const simpleGit = require('simple-git/promise');

const cwd = process.cwd();
const git = simpleGit(cwd);

const { version } = require(path.resolve(cwd, 'package.json'));

function exitProcess(code = 1) {
  console.log(); // Keep an empty line here to make looks good~
  process.exit(code);
}

async function checkVersion() {
  console.log(chalk.cyan('===> Current Version:'), version);
}

async function checkBranch({ current }) {
  console.log(chalk.yellow('===> Current Branch:'), current);
}

async function checkCommit({ files }) {
  if (files.length) {
    console.log(chalk.yellow('===> You forgot something to commit.'));
    files.forEach(({ path: filePath, working_dir: mark }) => {
      console.log(' -', chalk.red(mark), filePath);
    });
    exitProcess();
  }
}

async function checkAll() {
  const status = await git.status();

  await checkVersion();

  await checkBranch(status);

  await checkCommit(status);
}

checkAll();

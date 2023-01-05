const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const { logError, logSuccess } = require('./log');
const { generateRouter } = require('./generate-router');

inquirer
  .prompt([{ name: 'folder' }])
  .then((answers) => {
    const { folder } = answers;
    generateRouter(folder);
  })
  .catch((err) => {
    logError(err);
  });

const chalk = require('chalk');

const log = console.log;
const logInfo = (...msg) => log(chalk.blueBright(...msg));
const logSuccess = (...msg) => log('✅', chalk.green(...msg));
const logWarn = (...msg) => log('❗️', chalk.yellowBright(...msg));
const logError = (...msg) => log('❌', chalk.redBright(...msg));

module.exports = {
  logInfo,
  logSuccess,
  logWarn,
  logError,
};

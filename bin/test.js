const program = require('commander');
const package = require('../package.json');

program
  .version(package.version)
  .option('-f, --foo', 'enable some foo')
  .option('-d, --debug', 'output extra debugging')
  .option('-s, --small', 'small pizza size')
  .option('-p, --pizza-type <type>', 'flavour of pizza');

// program.parse(process.argv);

program.command('release').description('build & push docker image');

const options = program.opts();
if (options.debug) console.log(options);
console.log('pizza details:');
if (options.small) console.log('- small pizza size');
if (options.pizzaType) console.log(`- ${options.pizzaType}`);

program.parse(process.argv);

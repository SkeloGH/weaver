const { parse } = require('./run/');

module.exports = {
  name: 'run',
  description: 'Runs the app with the loaded configuration',
  setup: (yargs) => yargs,
  parse,
};

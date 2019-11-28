const Debug = require('debug');

const logging = Debug('Weaver:CLI:commands');

module.exports = {
  name: 'run',
  description: 'Runs the app with the loaded configuration',
  setup: (yargs) => yargs,
  parse: (_argv) => {
    logging('run with the current configuration');
    return _argv;
  },
};

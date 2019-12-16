const Debug = require('debug');
const { client } = require('./add/');

const logging = Debug('Weaver:bin:commands:add');
const defaultMsg = `
  You need at least one command before moving on
    weaver add [client|query|ignoreField]`;

module.exports = {
  name: 'add',
  description: 'Interactive creation of client, query or ignoreField',
  setup: (yargs) => {
    const cmd = yargs.command(
      client.commandName,
      client.commandDesc,
      client.commandSpec,
      client.commandHandler,
    )
      .command('query', 'Interactive creation of a new query',
        (_yargs) => _yargs,
        (params) => {
          logging('query params', params);
          return params;
        })
      .command('ignoreField', 'Interactive creation of a new ignoreField',
        (_yargs) => _yargs,
        (params) => {
          logging('ignoreField params', params);
          return params;
        })
      .demandCommand(1, defaultMsg);
    return cmd;
  },
  parse: (_argv) => {
    logging('_argv', _argv);
    return _argv;
  },
};

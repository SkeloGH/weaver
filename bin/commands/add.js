const Debug = require('debug');
const { client, ignore } = require('./add/');

const logging = Debug('Weaver:bin:commands:add');

module.exports = {
  name: 'add',
  description: 'Creation of client, query or ignore',
  setup: (yargs) => {
    const defaultMsg = `
      You need at least one command before moving on
        weaver add [${client.commandName}|query|${ignore.commandName}]`;
    const cmd = yargs
      .command(
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
      .command(
        ignore.commandName,
        ignore.commandDesc,
        ignore.commandSpec,
        ignore.commandHandler,
      )
      .demandCommand(1, defaultMsg);
    return cmd;
  },
  parse: (_argv) => {
    logging('_argv', _argv);
    return _argv;
  },
};

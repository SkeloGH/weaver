const Debug = require('debug');
const { client, ignore } = require('./remove/');

const logging = Debug('Weaver:bin:commands:remove');

module.exports = {
  name: 'remove',
  description: 'Removal of clients, queries or ignores',
  setup: (yargs) => {
    const cmd = yargs
      .command(
        client.commandName,
        client.commandDesc,
        client.commandSpec,
        client.commandHandler,
      )
      .command('query', 'Removal of one or more queries',
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
      );
    return cmd;
  },
  parse: (_argv) => {
    logging('_argv', _argv);
    return _argv;
  },
};

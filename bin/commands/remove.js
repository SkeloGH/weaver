const Debug = require('debug');
const { client } = require('./remove/');

const logging = Debug('Weaver:bin:commands:remove');

module.exports = {
  name: 'remove',
  description: 'Interactive removal of clients, queries or ignoreFields',
  setup: (yargs) => {
    const cmd = yargs.command(
      client.commandName,
      client.commandDesc,
      client.commandSpec,
      client.commandHandler,
    )
      .command('query', 'Interactive removal of one or more queries',
        (_yargs) => _yargs,
        (params) => {
          logging('query params', params);
          return params;
        })
      .command('ignoreField', 'Interactive removal of one or more ignoreFields',
        (_yargs) => _yargs,
        (params) => {
          logging('ignoreField params', params);
          return params;
        });
    return cmd;
  },
  parse: (_argv) => {
    logging('_argv', _argv);
    return _argv;
  },
};

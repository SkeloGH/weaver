const Debug = require('debug');

const logging = Debug('Weaver:bin:commands:add');

module.exports = {
  name: 'add',
  description: 'Interactive creation of client, query or ignoreField',
  setup: (yargs) => {
    const cmd = yargs.command('client', 'Interactive creation of a new client',
      (_yargs) => _yargs,
      (params) => {
        logging('client params', params);
        return params;
      })
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
        });
    return cmd;
  },
  parse: (_argv) => {
    logging('_argv', _argv);
    return _argv;
  },
};

const Debug = require('debug');
const shell = require('shelljs');

const {
  getConfig,
} = require('../lib/config');
const Weaver = require('../../src');

const logging = Debug('Weaver:bin:commands:run');

module.exports = {
  name: 'run',
  description: 'Runs the app with the loaded configuration',
  setup: (yargs) => yargs,
  parse: (_argv) => {
    logging(`getting config from argv ${_argv}`);
    const config = getConfig(_argv);
    const configStr = JSON.stringify(config, null, 2);
    let message = `Running with the current configuration"\n ${configStr}`;

    if (!config.dataClients || !config.dataClients.length) {
      message = `Error: dataClients not set, try adding them:
      - To the configuration file, or
      - Using the configuration wizard
      `;
      return shell.echo(message);
    }
    shell.echo(message);

    const weaver = new Weaver(config);
    weaver.run((result) => {
      logging('Result', result);
      logging('Done');
      weaver.disconnect(process.exit);
    });
    return _argv;
  },
};

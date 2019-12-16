const Debug = require('debug');
const shell = require('shelljs');

const {
  getConfig,
} = require('../lib/config');
const Weaver = require('../../src');
const WeaverMongoClient = require('../../src/clients/mongodb');

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
    const hasQueries = config.queries && config.queries.length > 0;
    const hasDataClients = config.dataClients && config.dataClients.length > 0;
    const validConfig = hasDataClients && hasQueries;

    config.dataClients = config.dataClients.map((c) => {
      if (c.family.indexOf('mongo') > -1) { return new WeaverMongoClient(c); }
      return c;
    });

    if (!hasDataClients) {
      message = `Error: dataClients not set, try:
      weaver add [client|query|ignoreField]
      `;
    }
    if (!hasQueries) {
      message = `Error: queries not set, try:
      weaver run --queries <a document id>
      `;
    }
    shell.echo(message);

    if (!validConfig) return _argv;
    const weaver = new Weaver(config);
    weaver.run((result) => {
      logging('Result', result);
      logging('Done');
      weaver.disconnect(process.exit);
    });
    return _argv;
  },
};

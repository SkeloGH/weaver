const Debug = require('debug');
const shell = require('shelljs');
const ObjectId = require("bson-objectid");
const ldLang = require('lodash');

const {
  getConfig,
} = require('../lib/config');
const Weaver = require('../../src');
const WeaverMongoClient = require('../../src/clients/mongodb');

const logging = Debug('Weaver:bin:commands:run');
const clientsByFamily = {
  mongodb: WeaverMongoClient,
};

module.exports = {
  name: 'run',
  description: 'Runs the app with the loaded configuration',
  setup: (yargs) => yargs,
  parse: (_argv) => {
    logging(`getting config from argv ${_argv}`);
    const config = getConfig(_argv);
    const configStr = JSON.stringify(config, null, 2);
    let message = `Running with the current configuration"\n ${configStr}`;
    const hasQueries = !ldLang.isEmpty(config.queries);
    const hasDataClients = !ldLang.isEmpty(config.dataClients);
    const validConfig = hasDataClients && hasQueries;

    if (!hasDataClients) {
      message = `Error: dataClients not set, try:
      weaver add [client|query|ignore]
      `;
    }
    if (!hasQueries) {
      message = `Error: queries not set, try:
      weaver run --queries <a document id>
      `;
    }
    shell.echo(message);
    if (!validConfig) return _argv;

    // TODO: need to delegate this conversion to each client
    // once starting to add new client families
    config.dataClients = config.dataClients.map((c) => {
      const ClientConstructor = clientsByFamily[c.family];
      if (ClientConstructor) { return new ClientConstructor(c); }
      return c;
    });
    config.queries = config.queries.map((q) => ({ _id: ObjectId(q) }));

    const weaver = new Weaver(config);
    weaver.run((result) => {
      logging('Result', result);
      shell.echo('Done');
      weaver.disconnect(process.exit);
    });
    return _argv;
  },
};

const Debug = require('debug');
const shell = require('shelljs');
const ObjectId = require('bson-objectid');
const ldLang = require('lodash/lang');
const ldObject = require('lodash/object');
const ldColl = require('lodash/collection');

const {
  getConfig,
} = require('../../lib/config');
const Weaver = require('../../../src');
const WeaverMongoClient = require('../../../src/clients/mongodb');

const logging = Debug('Weaver:bin:commands:run');
const clientsByFamily = {
  mongodb: WeaverMongoClient,
};

const _hasValidQueries = (queries) => {
  let validQueries = ldLang.isArray(queries);
  validQueries = validQueries && !ldLang.isEmpty(queries);
  validQueries = validQueries && !ldLang.isEmpty(queries[0]);
  validQueries = validQueries && ldColl.every(queries, ObjectId.isValid);
  return validQueries;
};

const _hasValidDataClient = (dataClient) => {
  let validDataClient = ldLang.isObject(dataClient);
  validDataClient = validDataClient && ldObject.hasIn(dataClient, 'type');
  validDataClient = validDataClient && (dataClient.type === 'target' || dataClient.type === 'source');
  validDataClient = validDataClient && ldObject.hasIn(dataClient, 'db');
  validDataClient = validDataClient && ldObject.hasIn(dataClient, 'db.url');
  validDataClient = validDataClient && ldObject.hasIn(dataClient, 'db.name');
  return validDataClient;
};

const _hasValidDataClientss = (dataClients) => {
  let validDataClients = ldLang.isArray(dataClients);
  validDataClients = validDataClients && !ldLang.isEmpty(dataClients);
  validDataClients = validDataClients && ldColl.every(dataClients, _hasValidDataClient);
  return validDataClients;
};

const _isValidConfig = (config) => {
  const hasQueries = _hasValidQueries(config.queries);
  const hasDataClients = _hasValidDataClientss(config.dataClients);
  const validConfig = hasDataClients && hasQueries;
  return { hasQueries, hasDataClients, validConfig };
};

const parse = (_argv) => {
  logging(`getting config from argv ${_argv}`);
  const config = getConfig(_argv);
  const configStr = JSON.stringify(config, null, 2);
  let message = `Running with the current configuration"\n ${configStr}`;
  const { validConfig, hasQueries, hasDataClients } = _isValidConfig(config);

  if (!hasDataClients) {
    message = `Error: dataClients not set, try:
    weaver add client
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
};

module.exports = {
  _hasValidQueries,
  _hasValidDataClient,
  _hasValidDataClientss,
  _isValidConfig,
  parse,
};

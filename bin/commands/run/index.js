const Debug = require('debug');
const ldLang = require('lodash/lang');
const ldObject = require('lodash/object');
const ldColl = require('lodash/collection');
const ObjectId = require('bson-objectid');
const uuid = require('uuid');
const shell = require('shelljs');

const {
  getConfig,
} = require('../../lib/config');
const Weaver = require('../../../src');
const WeaverMongoClient = require('../../../src/clients/mongodb');

const logging = Debug('Weaver:bin:commands:run');
const clientTypes = ['target', 'source'];
const clientFamilies = ['mongodb', 'postgres'];
const clientsByFamily = {
  mongodb: WeaverMongoClient,
};

const _hasValidQueries = (queries) => {
  let validQueries = ldLang.isArray(queries);
  validQueries = validQueries && !ldLang.isEmpty(queries);
  validQueries = validQueries && !ldLang.isEmpty(queries[0]);
  validQueries = validQueries && (
    ldColl.some(queries, ObjectId.isValid)
    || ldColl.some(queries, uuid.validate)
  );
  return validQueries;
};

const _isValidDataClient = (dataClient) => {
  let validDataClient = ldLang.isObject(dataClient);
  validDataClient = validDataClient && ldObject.hasIn(dataClient, 'type');
  validDataClient = validDataClient && ldObject.hasIn(dataClient, 'family');
  validDataClient = validDataClient && ldObject.hasIn(dataClient, 'db');
  validDataClient = validDataClient && ldObject.hasIn(dataClient, 'db.url');
  validDataClient = validDataClient && ldObject.hasIn(dataClient, 'db.name');
  validDataClient = validDataClient && ldObject.hasIn(dataClient, 'db.options');
  validDataClient = validDataClient && clientTypes.indexOf(dataClient.type) > -1;
  validDataClient = validDataClient && clientFamilies.indexOf(dataClient.family) > -1;
  validDataClient = validDataClient && ldLang.isObject(dataClient.db.options);
  return validDataClient;
};

// TODO: once starting to add new client families,
// add `family` as required second param, as it will be used to define clients and queries
const _hasValidDataClients = (dataClients) => {
  let validDataClients = ldLang.isArray(dataClients);
  validDataClients = validDataClients && !ldLang.isEmpty(dataClients);
  validDataClients = validDataClients && ldColl.every(dataClients, _isValidDataClient);
  return validDataClients;
};

// TODO: once starting to add new client families,
// add `family` as required second param, as it will be used to define clients and queries
const _parseClients = (dataClients) => dataClients.map((c) => {
  const ClientConstructor = clientsByFamily[c.family];
  if (ClientConstructor) { return new ClientConstructor(c); }
  return c;
});

const _parseQueries = (queries) => queries.map((q) => ({
  _id: ObjectId.isValid(q) ? ObjectId(q) : undefined,
  _uuid: uuid.validate(q) ? uuid.parse(q) : undefined,
}));

const _isValidConfig = (config) => {
  const hasDataClients = _hasValidDataClients(config.dataClients);
  const hasQueries = _hasValidQueries(config.queries);
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

  config.dataClients = _parseClients(config.dataClients);
  config.queries = _parseQueries(config.queries);

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
  _isValidDataClient,
  _hasValidDataClients,
  _isValidConfig,
  _parseClients,
  _parseQueries,
  parse,
};

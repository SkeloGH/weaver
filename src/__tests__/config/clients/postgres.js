const logging = require('debug');
const { WeaverPostgresClient } = require('../../../clients/postgres');

const log = logging('Weaver:__tests__:config:clients:postgres');
const PGHOST = 'localhost';

const source1 = {
  name: 'weaver--pg-test-source-1',
  url: PGHOST,
};

log('source1.url', source1.url);

const mockSourceClientConfig = {
  type: 'source',
  db: {
    url: source1.url,
    name: source1.name,
    options: {
      user: '',
      password: null,
      port: 5432,
    },
  },
  client: {
    ignoreFields: [],
  },
};

const mockTargetClientConfig = {
  type: 'target',
  origin: source1.name, // << note how is using source 1 as ref
  db: {
    user: 'postgres',
    url: PGHOST,
    name: 'weaver--pg-test-target-1',
    options: {},
  },
};

const dataClients = [
  /**
   * Source DB clients
   *  */
  new WeaverPostgresClient(mockSourceClientConfig),

  // /**
  //  * Target DB clients
  //  *  */
  new WeaverPostgresClient(mockTargetClientConfig),
];

module.exports = {
  mockSourceClientConfig,
  mockTargetClientConfig,
  dataClients,
};

const logging = require('debug');
const { WeaverPostgresClient } = require('../../../clients/postgres');

const log = logging('Weaver:__tests__:config:clients:postgres');
// let PGHOST = process.env || '';
let PGHOST = '';
PGHOST = PGHOST.replace('?', '');

const source1 = {
  name: 'weaver--pg-test-source-1',
  url: `${PGHOST}weaver--pg-test-target-1`,
};

log('process.env.MONGO_URL', PGHOST);
log('source1.url', source1.url);

const mockSourceClientConfig = {
  type: 'source',
  db: {
    url: source1.url,
    name: source1.name,
    options: {},
  },
  client: {
    ignoreFields: [],
  },
};

const mockTargetClientConfig = {
  type: 'target',
  origin: source1.name, // << note how is using source 1 as ref
  db: {
    url: `${PGHOST}weaver--pg-test-target-1`,
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

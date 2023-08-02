const logging = require('debug');
const WeaverMongoClient = require('../../../clients/mongodb');

const log = logging('Weaver:__tests__:config:clients:mongodb');
let { MONGO_URL } = process.env || '';
MONGO_URL = MONGO_URL.replace('?', '');

const source1 = {
  name: 'weaver--mongodb-test-source-1',
  url: `${MONGO_URL}weaver--mongodb-test-target-1`,
};

log('process.env.MONGO_URL', MONGO_URL);
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
    url: `${MONGO_URL}weaver--mongodb-test-target-1`,
    name: 'weaver--mongodb-test-target-1',
    options: {},
  },
};

const dataClients = [
  /**
   * Source DB clients
   *  */
  new WeaverMongoClient(mockSourceClientConfig),

  // /**
  //  * Target DB clients
  //  *  */
  new WeaverMongoClient(mockTargetClientConfig),
];

module.exports = {
  mockSourceClientConfig,
  mockTargetClientConfig,
  dataClients,
};

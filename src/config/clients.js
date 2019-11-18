/**
 *
 * @todo - This file should pull either the testing configuration when running in test mode,
 * or a `clients.out.js` file, when running in app/dev mode.
 * @todo - Sinthezise access to the `secret` object by using variables.
 * @todo - Warn here about the use of secret file. Add instructions.
 * @todo - Make client options not required.
 */
const fs = require('fs');
const path = require('path');

/**
 *
 * 1. Load up the clients according to your needs, in this case we'll only use MongoDB,
 * so we use `WeaverMongoClient`.
 */
const logging = require('debug')('Weaver:config/clients.js');
const WeaverMongoClient = require('../clients/mongodb');


/**
 *
 * 2. For this example, we use a secrets file. There's a file named `secret.example.js`,
 * copy it as `secret.out.js` and adjust accordingly.
 */
const secretFileName = path.join(__dirname, 'secret.out.js');

if (!fs.existsSync(secretFileName)) {
  logging(`
    \n\n********** Missing secret config file **********
    ${secretFileName}
    \n\nHave you tried renaming secret.example.js to secret.out.js?\n\n
  `);
  process.exit();
}
const secret = require('./secret.out');


/**
 *
 * 3. Create your `"source"` DB clients, for each `"source"`, there must be a `"target"` client.
 *
 * Example config:
 * {
 *    type: 'source',
 *    db: {
 *      url: 'mongodb://localhost:27020', // remote access through ssh port forwarding
 *      name: 'customers',
 *      options: {},
 *    },
 *    client: {
 *      ignoreFields: ['password']
 *    }
 *  }
 */
const sourceLocalDbClient1 = new WeaverMongoClient({
  type: 'source',
  db: {
    url: secret.local.db.url,
    /**
     * This is the name of the DB where lookups will be done.
     */
    name: secret.local.db.sources[0].name,
    options: secret.local.db.options,
  },
  client: {
    ignoreFields: secret.local.client.ignoreFields,
  },
});

const sourceLocalDbClient2 = new WeaverMongoClient({
  type: 'source',
  db: {
    url: secret.local.db.url,
    name: secret.local.db.sources[1].name,
    options: {},
  },
});


/**
 *
 * 4. Create your `"target"` DB clients, for each `"target"`, there must be a `"source"` client.
 * Example config:
 * {
 *    type: 'target',
 *    origin: 'customers',
 *    db: {
 *      url: 'mongodb://localhost:27017',
 *      name: 'customers_copy',
 *      options: {},
 *    }
 *  }
 */
const targetLocalDbClient1 = new WeaverMongoClient({
  type: 'target',
  /**
   * This is where you're pulling data from, the name of the `source` DB client.
   */
  origin: secret.local.db.sources[0].name,
  db: {
    url: secret.local.db.url,
    /**
     * This is the name of the DB where you want results to be saved. Prefix is not required.
     */
    name: `weaver-out-${secret.local.db.sources[0].name}`,
    options: {},
  },
});

const targetLocalDbClient2 = new WeaverMongoClient({
  type: 'target',
  origin: secret.local.db.sources[1].name,
  db: {
    url: secret.local.db.url,
    name: `weaver-out-${secret.local.db.sources[1].name}`,
    options: {},
  },
});


/**
 *
 * 5. Export clients, they're required by config/index.js
 *
 * You're all set! 🎉
 */
module.exports = [
  sourceLocalDbClient1,
  sourceLocalDbClient2,
  targetLocalDbClient1,
  targetLocalDbClient2,
];

const fs = require('fs');
const path = require('path');

const WeaverMongoClient = require('../clients/mongodb');
const logging = require('debug')('Weaver:config/clients.js');
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

const sourceLocalDbClient1 = new WeaverMongoClient({
  type: 'source',
  db: {
    url: secret.local.db.url, // string
    name: secret.local.db.sources[0].name, // string
    options: secret.local.db.options // object
  },
  client: {
    ignoreFields: secret.local.client.ignoreFields
  }
});

const sourceLocalDbClient2 = new WeaverMongoClient({
  type: 'source',
  db: {
    url: secret.local.db.url, // string
    name: secret.local.db.sources[1].name, // string
    options: {}
  }
});

const targetLocalDbClient1 = new WeaverMongoClient({
  type: 'target',
  origin: secret.local.db.sources[0].name,
  db: {
    url: secret.local.db.url, // string
    name: `weaver-out-${secret.local.db.sources[0].name}`,
    options: {}
  }
});

const targetLocalDbClient2 = new WeaverMongoClient({
  type: 'target',
  origin: secret.local.db.sources[1].name,
  db: {
    url: secret.local.db.url, // string
    name: `weaver-out-${secret.local.db.sources[1].name}`,
    options: {}
  }
});

const remoteDbClient = new WeaverMongoClient({
  type: 'source',
  db: {
    url: secret.remote.db.address, // string
    name: secret.remote.db.sources[0].name, // string
    options: {
      readPreference: 'secondary',
    }
  },
  /**
    https://www.npmjs.com/package/tunnel-ssh#config-example
    https://github.com/mscdex/ssh2#client-methods
   */
  sshTunelConfig : {
    port: secret.ssh.port, // number
    agent: secret.ssh.agent, // string
    username: secret.ssh.username, // string
    privateKey: secret.ssh.private_key, // string
    host: secret.remote.host, // string
    dstHost: secret.remote.host, // string
    dstPort: secret.remote.dstPort, // number
    localPort: secret.remote.localPort, // number
    localhost: secret.remote.localhost, // string
  }
});

module.exports = [
  sourceLocalDbClient1,
  sourceLocalDbClient2,
  targetLocalDbClient1,
  targetLocalDbClient2,
  // remoteDbClient,
];
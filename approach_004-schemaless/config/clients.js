const WeaverMongoClient = require('../clients/mongodb');

const secret = require('./secret.out');

const sourceLocalDbClient1 = new WeaverMongoClient({
  type: 'source',
  db: {
    url: secret.local.db.url, // string
    name: secret.local.db.sources[0].name, // string
    options: {}
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

const targetLocalDbClient = new WeaverMongoClient({
  type: 'target',
  db: {
    url: secret.local.db.url, // string
    name: 'weaver-output',
    options: {}
  }
});

const remoteDbClient = new WeaverMongoClient({
  type: 'source',
  db: {
    url: secret.remote.db.address, // string
    name: secret.remote.db.source.name, // string
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
  targetLocalDbClient,
  // remoteDbClient,
];
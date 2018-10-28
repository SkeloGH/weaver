const mongo = require('mongodb');
const tunnel = require('tunnel-ssh');
const MongoClient = mongo.MongoClient;


class WeaverMongoClient {
  /** config:
    {
      type: 'source' || 'target',
      db: {
        url: // remote db address <string>,
        name: // remote db name <string>,
        options: {
          [http://mongodb.github.io/node-mongodb-native/3.1/reference/connecting/connection-settings/]
        }
      },
      sshTunelConfig : {
        [https://www.npmjs.com/package/tunnel-ssh#config-example]
        [https://github.com/mscdex/ssh2#client-methods]
      }
    }
  */
  constructor(config) {
    this.type   = config.type;
    this.config = config;
    this.remote = null;
  }

  connect() {
    const host = this.config.db.url;
    const options = this.config.db.options;
    const connectorPromise = MongoClient.connect;

    if(!this.config.sshTunnelConfig) return connectorPromise(host, options);

    this.remote = tunnel(this.config.sshTunnelConfig, (error, server) => {
      if (error) {
        console.error("sshTunnel connection error: ", error)
        return process.exit();
      }
      return connectorPromise(host, options);
    });
  }

  fetch() {
  }

  out(dataBucket) {
    if (this.result) {
      dataBucket.push(this.result);
    }
  }

  onError(err) {
    this.config.onError && this.config.onError(err);
  }


  disconnect(data, cb) {
    this.remote.close();
  }
}

module.exports = WeaverMongoClient
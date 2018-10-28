const mongo   = require('mongodb');
const tunnel  = require('tunnel-ssh');
let logging;

const MongoClient = mongo.MongoClient;


/**
  @class WeaverMongoClient
  @arguments config<Object>:
    {
      type: 'source' || 'target',
      db: {
        url: <String> db address, ex: 'mongodb://localhost:27017'
        name: <String>db name ex: 'my-app-store',
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
class WeaverMongoClient {
  constructor(config) {
    logging     = require('debug')('WeaverMongoClient:'+config.db.name);
    this.type   = config.type;
    this.config = config;
    this.client = null;
    this.remote = null;
    // Hide mongo deprecation notice by using the new url parser
    this.config.db.options['useNewUrlParser'] = true;
    this.fetch = this.fetch.bind(this);
    this.listCollections = this.listCollections.bind(this);
  }

  connect() {
    logging('connecting MongoDb client');
    return new Promise((resolve, reject) => {
      const host = this.config.db.url;
      const options = this.config.db.options;

      if(!this.config.sshTunnelConfig){
        MongoClient.connect(host, options, (error, database) => {
          if (error) reject(this.onError(error, 'failed to connect'));
          logging('connection success');
          this.client = database.db(this.config.db.name);
          return resolve(this.client);
        })
      }

      // this.remote = tunnel(this.config.sshTunnelConfig)
      //   .then((error, server) => {
      //     if (error){
      //       this.onError(error);
      //       return reject(error);
      //     }
      //     return resolve(connectorPromise(host, options));
      //   });
    });
  }

  fetch(query) {
    return () => {
      return new Promise((resolve, reject) => {
        this.listCollections((collections) => {
          const results = [];

          collections.forEach(collection => {
            this.client.collection(collection)
            .find(query)
            .toArray().then((documents) => {
              if (documents.length >= 1) {
                logging(collection + '.find('+query+')');
                logging(documents);
              }
            })
          })
          resolve({'hello':'world'});
        });
      });
    }
  }

  listCollections(cb) {
    this.client
      .listCollections({} , { nameOnly:true })
      .toArray().then((collections) => {
        return cb(collections.map(result => result.name));
      });
  }

  out(dataBucket) {
    if (this.result) {
      dataBucket.push(this.result);
    }
  }

  onError(error, message) {
    if (message) console.error(message, error);
    return this.config.onError && this.config.onError(error);
  }


  disconnect(data, cb) {
    this.remote.close();
  }
}

module.exports = WeaverMongoClient
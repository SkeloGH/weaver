const mongo   = require('mongodb');
const tunnel  = require('tunnel-ssh');
const logging = require('debug');
const md5     = require('md5');

const MongoClient = mongo.MongoClient;
const ObjectId    = mongo.ObjectID;


/**
  * A MongoDB client wrapper interface for Weaver
  * @class WeaverMongoClient
  * @param {object} config:
  *   {
  *     @key type {string} - the type of db client:
  *       @enum 'source' - the client is a data source
  *       @enum 'target' - the client is a data target
  *     @key db {object}:
  *       {
  *         @key url {string} - the db url address:
  *           @value 'mongodb://localhost:27017'
  *         @key name {string} - the client db name:
  *           @value 'my-app-store'
  *         @key options {object} - node-mongodb-native options: http://mongodb.github.io/node-mongodb-native/3.1/reference/connecting/connection-settings/]
  *       }
  *     },
  *     @key sshTunelConfig {object} - tunnel-ssh options: {
  *       [https://www.npmjs.com/package/tunnel-ssh#config-example]
  *       [https://github.com/mscdex/ssh2#client-methods]
  *     }
  *   }
*/
class WeaverMongoClient {
  constructor(config) {
    this.db          = null;
    this.remote      = null;
    this.collections = [];
    this.collNames   = [];
    this.__cache     = {};

    this._configure(config);
  }

  _configure = (config) => {
    this.logging = logging(`WeaverMongoClient:${config.db.name}`);
    this.type    = config.type;
    this.config  = config;

    // Hide mongo deprecation notice by using the new url parser
    this.config.db.options['useNewUrlParser'] = true;
    return this;
  }

  connect = () => {
    const host    = this.config.db.url;
    const options = this.config.db.options;

    if (!this.config.sshTunnelConfig) {
      this.logging('Connecting MongoDb client');
      return MongoClient.connect(host, options)
        .then(this._onClientConnect);
    }

    // this.remote = tunnel(this.config.sshTunnelConfig)
    //   .then((error, server) => {
    //     if (error){
    //       this.onError(error);
    //       return reject(error);
    //     }
    //     this._fetchCollections(resolve);
    //   });
  }

  _onClientConnect = (database) => {
    this.db = database.db(this.config.db.name);
    this.logging('Connection success');
    return this._fetchCollections();
  }

  _fetchCollections = () => {
    this.logging('Listing collections');
    return this.db.listCollections({} , { nameOnly:true })
      .toArray()
      .then(this._saveCollections);
  }

  _saveCollections = (collections) => {
    this.collections = collections;
    this.collNames = collections.map(result => result.name);
    return Promise.resolve(this.collNames);
  }

  query = (query) => {
    const dbScans = this.collNames.map(this._fetchDocument.bind(this, query));

    return Promise.all(dbScans)
    .catch(this.onError)
    .then(results => {
      const dataEntry = results.filter(result => !!result);
      return Promise.resolve(dataEntry);
    });
  }

  _fetchDocument = (query, collection) => {
    const queryHash = md5(JSON.stringify(query));

    if (this.__cache[queryHash]) return Promise.resolve(this.__cache[queryHash]);

    return this.db.collection(collection).findOne(query)
      .catch(this.onError)
      .then(document => {
        let formattedResult;
        if (document) {
          formattedResult = {
            database: this.config.db.name,
            dataSet: collection,
            data: document
          };
          this._cache(queryHash, formattedResult);
          this.logging(`${collection}.find(${JSON.stringify(query)}):`);
          this.logging(`${JSON.stringify(formattedResult, null, 2)}`);
        }

        return Promise.resolve(formattedResult);
      });
  }

  _cache = (key, data) => {
    this.__cache[key] = data;
  }

  /**
    * Recursively finds id-looking values
    * @return {array} valid ObjectIds converted to string:
    *   ["12345678901234567890"]
  */
  idsInDoc = (document, carry) => {
    const validDoc = typeof document !== 'undefined' && document !== null;
    const isArray  = Array.isArray(document);
    const isObject = !isArray && typeof document === 'object';
    const ids      = carry || [];

    if (!validDoc) return ids;

    if ((typeof document === 'string' && ObjectId.isValid(document)) || ObjectId.isValid(document.toString())) {
      ids.push(document.toString());
    } else if (isArray) {
      document.forEach(doc => ids.concat(this.idsInDoc(doc, ids)));
    } else if (isObject) {
      Object.keys(document).map(key => {
        return ids.concat(this.idsInDoc(document[key], ids));
      });
    }

    return ids;
  }

  idsToQuery = (ids) => {
    return ids.map(_id => {
      return { _id: ObjectId(_id)}
    });
  }

  get data() {
    return {
      db: this.config.db.name,
      results: this.__cache,
    };
  }

  onError = (error, message) => {
    if (message) this.logging(message, error);
    return this.config.onError && this.config.onError(error);
  }

  disconnect = (data, cb) => {
    this.remote.close();
    cb();
  }
}

module.exports = WeaverMongoClient;

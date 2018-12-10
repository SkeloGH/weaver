const mongo   = require('mongodb');
const tunnel  = require('tunnel-ssh');
const logging = require('debug');
const md5     = require('md5');

const Utils   = require('./util');

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
  *     @key client {object} - WeaverMongoClient-specific configurations:
  *       {
  *         @key ignoreFields {array} - The list of collection names to avoid querying
  *       }
  *     @key sshTunnelConfig {object} - tunnel-ssh options: {
  *       [https://www.npmjs.com/package/tunnel-ssh#config-example]
  *       [https://github.com/mscdex/ssh2#client-methods]
  *     }
  *   }
*/
class WeaverMongoClient extends Utils {
  constructor(config) {
    super(config);
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
    this.ignoreFields = config.client && config.client.ignoreFields || [];

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
    const queryCache = this.__cache[queryHash];

    if (queryCache) return Promise.resolve(queryCache);
    if (this.ignoreFields.indexOf(collection) > -1) return Promise.resolve(queryCache);

    return this.db.collection(collection).findOne(query)
      .catch(this.onError)
      .then(document => {
        if (document) {
          this.logging(`${collection}.find(${JSON.stringify(query)}):`);
          this.logging(`${JSON.stringify(document, null, 2)}`);
        }
        return this._cacheDocument(queryHash, collection, document);
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

  digest = (dbContent) => {
    this.logging(dbContent);
    return Promise.all(dbContent.map(this.saveDocument));
  }

  saveDocument = (document) => {
    const collection = document.dataSet;
    const _id = document.data._id;
    const query = { _id: _id };

    return this.db.collection(collection)
      .findOne(query)
      .then(result => {
        if (result) return this.handleSavedDocument(result);
        return this.db.collection(collection).insertOne(document.data);
    });
  }

  handleSavedDocument = (document) => {
    return Promise.resolve(document);
  }
}

module.exports = WeaverMongoClient;

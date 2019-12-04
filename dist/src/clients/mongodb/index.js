"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const mongo = require('mongodb');

const logging = require('debug');

const md5 = require('md5');

const Utils = require('./util');

const {
  MongoClient
} = mongo;
/**
 * @class WeaverMongoClient A MongoDB client interface for Weaver
*/

class WeaverMongoClient extends Utils {
  /**
   *
   * Consumes the given configuration object and initializes dependencies.
   * @constructor
   * @param {Object} config
   * @param {'source' | 'target'} config.type - the type of db client:
   *  'source' - the client is a data source
   *  'target' - the client is a data target
   * @param {Object} config.db
   * @param {string} config.db.url - the db url address:
   *   example 'mongodb://localhost:27017'
   * @param {string} config.db.name - the client db name:
   *  example 'my-app-store'
   * @param {Object} config.db.options - node-mongodb-native options: http://mongodb.github.io/node-mongodb-native/3.1/reference/connecting/connection-settings/]
   * @param {Object} config.client - WeaverMongoClient-specific configurations:
   * @param {Array.<string>} config.client.ignoreFields - The list of collection names to
   *  avoid querying
   * @return {WeaverMongoClient} this
  */
  constructor(_config) {
    super(_config);

    _defineProperty(this, "_configure", config => {
      this.logging = logging(`WeaverMongoClient:${config.db.name}`);
      this.type = config.type;
      this.config = config;
      this.ignoreFields = config.client && config.client.ignoreFields || []; // Hide mongo deprecation notice by using the new url parser

      this.config.db.options.useNewUrlParser = true;
      return this;
    });

    _defineProperty(this, "connect", () => {
      const host = this.config.db.url;
      const {
        options
      } = this.config.db;
      this.client = MongoClient;
      this.logging('Connecting MongoDb client');
      return this.client.connect(host, options).then(this._onClientConnect);
    });

    _defineProperty(this, "disconnect", (force, cb) => this.database.close(force, cb));

    _defineProperty(this, "_onClientConnect", database => {
      this.database = database;
      this.db = database.db(this.config.db.name);
      this.logging('Connection success');
      return this._fetchCollections();
    });

    _defineProperty(this, "_fetchCollections", () => {
      this.logging('Listing collections');
      return this.db.listCollections({}, {
        nameOnly: true
      }).toArray().then(this._saveCollections);
    });

    _defineProperty(this, "_saveCollections", collections => {
      this.collections = collections;
      this.collNames = collections.map(result => result.name);
      return Promise.resolve(this.collNames);
    });

    _defineProperty(this, "query", query => {
      const dbScans = this.collNames.map(this._fetchDocument.bind(this, query));
      return Promise.all(dbScans).catch(this.onError).then(results => {
        const dataEntry = results.filter(result => !!result);
        return Promise.resolve(dataEntry);
      });
    });

    _defineProperty(this, "_fetchDocument", (query, collection) => {
      const queryHash = md5(JSON.stringify(query));
      const queryCache = this.__cache[queryHash];
      if (queryCache) return Promise.resolve(queryCache);
      if (this.ignoreFields.indexOf(collection) > -1) return Promise.resolve(queryCache);
      return this.db.collection(collection).findOne(query).catch(this.onError).then(document => {
        if (document) {
          this.logging(`${collection}.findOne(${JSON.stringify(query)}):`);
          this.logging(`  ${JSON.stringify(document, null, 2)}`);
        }
        /**
         * @todo - Avoid using inheritance for _cacheDocument, is not clear the benefit of it.
         */


        return this._cacheDocument(queryHash, collection, document);
      });
    });

    _defineProperty(this, "onError", (error, message) => {
      if (message) this.logging(message, error);
      return this.config.onError && this.config.onError(error);
    });

    _defineProperty(this, "digest", dbContent => {
      this.logging('digesting:', dbContent);
      return Promise.all(dbContent.map(this.saveDocument));
    });

    _defineProperty(this, "saveDocument", document => {
      const collection = document.dataSet;
      const {
        _id
      } = document.data;
      const query = {
        _id
      };
      return this.db.collection(collection).findOne(query).then(result => {
        if (result) return this.handleSavedDocument(result);
        return this.db.collection(collection).insertOne(document.data);
      });
    });

    _defineProperty(this, "handleSavedDocument", document => Promise.resolve(document));

    this.db = null;
    this.remote = null;
    this.collections = [];
    this.collNames = [];
    this.__cache = {};

    this._configure(_config);
  }
  /**
   *
   * Splits `config` into `this` class properties.
   * @param {Object} config - The cass configuration object
   * @param {Array.<WeaverMongoClient>} config.dataClients - Instances of the clients to run
   * the queries on.
   * @returns {this} - instance of WeaverMongoClient
   */


  /**
   * @todo Use a const to build the object, then return the const.
   * @returns {Object} - Formatted reference to this db client name and the currently
   * cached results.
   */
  get data() {
    return {
      db: this.config.db.name,
      results: this.__cache
    };
  }
  /**
   * Displays the given error message and calls the custom error handler, if given.
   * @param {Object} error - The object containing the exception details.
   * @param {String} message - The exception message to be displayed.
   * @returns {any} - The return value of the custom error callback.
   */


}

module.exports = WeaverMongoClient;
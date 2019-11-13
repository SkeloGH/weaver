const mongo = require('mongodb');
const logging = require('debug');
const md5 = require('md5');

const Utils = require('./util');

const { MongoClient } = mongo;


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
  constructor(config) {
    super(config);
    this.db = null;
    this.remote = null;
    this.collections = [];
    this.collNames = [];
    this.__cache = {};

    this._configure(config);
  }

  /**
   *
   * Splits `config` into `this` class properties.
   * @param {Object} config - The cass configuration object
   * @param {Array.<WeaverMongoClient>} config.dataClients - Instances of the clients to run
   * the queries on.
   * @returns {this} - instance of WeaverMongoClient
   */
  _configure = (config) => {
    this.logging = logging(`WeaverMongoClient:${config.db.name}`);
    this.type = config.type;
    this.config = config;
    this.ignoreFields = (config.client && config.client.ignoreFields) || [];

    // Hide mongo deprecation notice by using the new url parser
    this.config.db.options.useNewUrlParser = true;
    return this;
  }

  /**
   *
   * Initializes each of the `clients` connections by calling their own `connect method.
   * @param {Array.<WeaverMongoClient>} clients - List of `WeaverMongoClient` instances.
   * @returns {Promise.<Array>} The client DB collection names.
   */
  connect = () => {
    const host = this.config.db.url;
    const { options } = this.config.db;

    this.logging('Connecting MongoDb client');
    return MongoClient.connect(host, options)
      .then(this._onClientConnect);
  }

  /**
   * MongoClient connection success handler.
   * Saves local a reference to the MongoDB `database` client and retrieves the collection names.
   * @param {MongoClient.<DBConstructor>} database - The DB client API.
   * @returns {Promise.<Array>} The client DB collection names.
   */
  _onClientConnect = (database) => {
    this.db = database.db(this.config.db.name);
    this.logging('Connection success');
    return this._fetchCollections();
  }

  /**
   * Retrieves the collection names from `MongoClient`.
   * @todo - Rename _fetchCollections to _fetchCollectionNames
   * @returns {Promise.<Array>} The client DB collection names.
  */
  _fetchCollections = () => {
    this.logging('Listing collections');
    return this.db.listCollections({}, { nameOnly: true })
      .toArray()
      .then(this._saveCollections);
  }

  /**
   * Saves a local reference to the `Array` of `collection` `Objects`.
   * Saves and returns a local reference to the  `Array` of `collection.name` `Strings`.
   * @param {Array.<String>} collections - The list of collection names.
   * @returns {Promise.<Array>} The client DB collection names.
   */
  _saveCollections = (collections) => {
    this.collections = collections;
    this.collNames = collections.map((result) => result.name);
    return Promise.resolve(this.collNames);
  }

  /**
   * Runs the given `query` against each MongoDB client collections. Filters null/undefined results.
   * @param {Object} query - The query `Object`.
   * @returns {Array.<Object>} - The query results.
   */
  query = (query) => {
    const dbScans = this.collNames.map(this._fetchDocument.bind(this, query));

    return Promise.all(dbScans)
      .catch(this.onError)
      .then((results) => {
        const dataEntry = results.filter((result) => !!result);
        return Promise.resolve(dataEntry);
      });
  }

  /**
   * Hashes the given `query` and returns the result of such query if exists in cache, otherwise
   * runs the given `query` against each MongoDB client collections and then caches the result.
   * @todo log each query regardless of it not returning documents.
   * @param {Object} query - The query `Object`.
   * @param {String} collection - The db collection name to query against.
   * @returns {Array.<Object>} - The query results.
   */
  _fetchDocument = (query, collection) => {
    const queryHash = md5(JSON.stringify(query));
    const queryCache = this.__cache[queryHash];

    if (queryCache) return Promise.resolve(queryCache);
    if (this.ignoreFields.indexOf(collection) > -1) return Promise.resolve(queryCache);

    return this.db.collection(collection).findOne(query)
      .catch(this.onError)
      .then((document) => {
        if (document) {
          this.logging(`${collection}.findOne(${JSON.stringify(query)}):`);
          this.logging(`  ${JSON.stringify(document, null, 2)}`);
        }
        /**
         * @todo - Avoid using inheritance for _cacheDocument, is not clear the benefit of it.
         */
        return this._cacheDocument(queryHash, collection, document);
      });
  }

  /**
   * @todo Use a const to build the object, then return the const.
   * @returns {Object} - Formatted reference to this db client name and the currently
   * cached results.
   */
  get data() {
    return {
      db: this.config.db.name,
      results: this.__cache,
    };
  }

  /**
   * Displays the given error message and calls the custom error handler, if given.
   * @param {Object} error - The object containing the exception details.
   * @param {String} message - The exception message to be displayed.
   * @returns {any} - The return value of the custom error callback.
   */
  onError = (error, message) => {
    if (message) this.logging(message, error);
    return this.config.onError && this.config.onError(error);
  }

  /**
   * Closes any connection to a remote host. And calls the custom callback
   * @todo data param is no longer in use, deprecate.
   * should wait until remote successfully closes.
   * cb should expect an error object.
   * @returns undefined
   */
  disconnect = (data, cb) => {
    this.remote.close();
    cb();
  }

  /**
   * Mechanism to persist the received documents in this client db.
   * Given a `dbContent` list of data entries, call `saveDocument` iteratively
   * to save each document individually.
   * @param {Array.<Object>} dbContent - A list of data entries
   * @returns {Promise.<Object>} - The insert operation client response.
   */
  digest = (dbContent) => {
    this.logging(dbContent);
    return Promise.all(dbContent.map(this.saveDocument));
  }

  /**
   * Looks up the document for previous existence, otherwise
   * persists the given `document` in this client db.
   * @param {Object} document - A list of data entries
   * @interface document.dataSet - The collection name
   * @interface document.data - The MongoDB document to be saved.
   * @returns {Promise.<Object>} - The db document, if it existed, otherwise the insert
   * operation client response.
   * @todo rename `document.dataSet` to `document.collectionName`. Standardize the return response.
   */
  saveDocument = (document) => {
    const collection = document.dataSet;
    const { _id } = document.data;
    const query = { _id };

    return this.db.collection(collection)
      .findOne(query)
      .then((result) => {
        if (result) return this.handleSavedDocument(result);
        return this.db.collection(collection).insertOne(document.data);
      });
  }

  /**
   * Customizes the response when an existing document is found.
   * @param {Object} document - A MongoDB document.
   * @returns {Promise.<Object>} - The given `document`.
   */
  handleSavedDocument = (document) => Promise.resolve(document);
}

module.exports = WeaverMongoClient;

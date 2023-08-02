const logging = require('debug');
const { getPGClient } = require('./pgclient');

/**
 * @class WeaverPostgresClient A Postgres client interface for Weaver
*/
class WeaverPostgresClient {
/**
 *
 * Receives a configuration object to initialize the constructor.
 * @constructor
 * @param {Object} config
 * @param {'source' | 'target'} config.type - the type of db client:
 *  'source' - the client is a data source
 *  'target' - the client is a data target
 * @param {Object} config.db
 * @param {string} config.db.url - the db url address:
 *   example 'postgres://username:password@host:port/database'
 * @param {string} config.db.name - the client db name:
 *  example 'my-app-store'
 * @param {Object} config.db.options - node-postgres options: https://node-postgres.com/features/connecting
 * @param {Object} config.client - WeaverPostgresClient-specific configurations:
 * @param {Array.<string>} config.client.ignoreFields - The list of tables to
 *  avoid querying
 * @return {WeaverPostgresClient} this
*/
  constructor(config) {
    // super(config);
    this.db = null;
    this.tableNames = [];
    this.__cache = {};

    this._configure(config);
  }

  /**
   *
   * Splits `config` into `this` class properties.
   * @param {Object} config - The cass configuration object
   * @param {Array.<WeaverPostgresClient>} config.dataClients - Instances of the clients to run
   * the queries on.
   * @returns {this} - instance of WeaverPostgresClient
   */
  _configure = (config) => {
    this.logging = logging(`WeaverPostgresClient:${config.db.name}`);
    this.type = config.type;
    this.config = config;
    this.ignoreFields = (config.client && config.client.ignoreFields) || [];
    return this;
  }

  /**
   *
   * Initializes the `client` connection
   * @returns {Promise.<Array>} The client DB collection names.
   */
  connect = async () => {
    const Client = getPGClient(this.config.client);
    const {
      url: host,
      name: database,
      options,
    } = this.config.db;

    this.client = new Client({
      user: options.user,
      host,
      database,
      password: options.password,
      port: options.port,
    });

    this.logging('Connecting Postgres client');
    await this.client.connect();
    // this._onClientConnect(this.client);
    return this.client;
  }

  /**
   * Postgres client connection success handler.
   * Saves local a reference to the Postgres DB client and retrieves the collection names.
   * @param {MongoClient.<DBConstructor>} database - The DB client API.
   * @returns {Promise.<Array>} The client DB collection names.
   */
  _onClientConnect = (database) => {
    this.database = database;
    this.db = database;
    this.logging('Connection success');
    // return this._fetchCollections();
  }

  /**
   * Retrieves the collection names from Postgres DB.
   * @todo - Rename _fetchCollections to _fetchCollectionNames
   * @returns {Promise.<Array>} The client DB collection names.
  */
  //  _fetchCollections = () => {
  //    this.logging('Listing collections');
  //    return this.db.listCollections({}, { nameOnly: true })
  //      .toArray()
  //      .then(this._saveCollections);
  //  }

  /**
   * Saves a local reference to the `Array` of `collection` `Objects`.
   * Saves and returns a local reference to the  `Array` of `collection.name` `Strings`.
   * @param {Array.<String>} collections - The list of collection names.
   * @returns {Promise.<Array>} The client DB collection names.
   */
  // _saveCollections = (collections) => {
  //   this.collections = collections;
  //   this.collNames = collections.map((result) => result.name);
  //   return Promise.resolve(this.collNames);
  // }
}

module.exports = {
  WeaverPostgresClient,
};

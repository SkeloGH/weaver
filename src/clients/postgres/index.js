const logging = require('debug');

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
}

/**
 *
 * Splits `config` into `this` class properties.
 * @param {Object} config - The cass configuration object
 * @param {Array.<WeaverPostgresClient>} config.dataClients - Instances of the clients to run
 * the queries on.
 * @returns {this} - instance of WeaverPostgresClient
 */
const _configure = (config) => {
  this.logging = logging(`WeaverPostgresClient:${config.db.name}`);
  this.type = config.type;
  this.config = config;
  this.ignoreFields = (config.client && config.client.ignoreFields) || [];

  // Hide mongo deprecation notice by using the new url parser
  this.config.db.options.useNewUrlParser = true;
  return this;
};

WeaverPostgresClient.prototype._configure = _configure;

module.exports = {
  WeaverPostgresClient,
  _configure,
};

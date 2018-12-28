const logging  = require('debug');

const WeaverCollect = require('./collect');
const WeaverDigest = require('./digest');

/**
  *
  * The main API class
  * @class Weaver
*/
class Weaver {
/**
  *
  * Consumes the given configuration object and initializes dependencies.
  * @constructor
  * @param {Object} config
  * @param {Array.<Object>} config.queries
  * @param {Array.<WeaverMongoClient>} config.dataClients
  * @param {Object} config.jsonConfig
  * @param {string} config.jsonConfig.filePath
*/
  constructor(config) {
    this.__cache = {};
    this.collect = new WeaverCollect(config);
    this.digest  = new WeaverDigest(config);
    return this._configure(config);
  }

/**
  *
  * Assigns the configuration object values to class properties.
  * @param {Object} config
  * @param {Array.<Object>} config.queries
  * @param {Array.<WeaverMongoClient>} config.dataClients
  * @param {Object} config.jsonConfig
  * @param {string} config.jsonConfig.filePath
  * @returns {this} this
*/
  _configure(config) {
    this.logging     = logging(`Weaver`);
    this.queries     = config.queries;
    this.dataClients = config.dataClients;
    this.jsonConfig  = config.jsonConfig;
    this.dataSources = this.dataClients.filter(client => client.config.type === 'source');
    this.dataTargets = this.dataClients.filter(client => client.config.type === 'target');
    return this;
  }

/**
  *
  * Given a results object, uses the standad output to print the results.
  * @param {Object} results
  * @returns {Promise.<Object>}
*/
  showResults = (results) => {
    const dataEntries = Object.keys(results);
    this.logging(`Found interlaced dataEntries: ${dataEntries.join(', ')}`);
    this.logging(`Total dataEntries: ${dataEntries.length}`);
    return Promise.resolve(results);
  }

/**
  *
  * Given a list of clients, initialize their connections by calling their own connect method.
  * @param {Array.<WeaverMongoClient>} clients
  * @returns {Promise.<Object>}
*/
  connectClients = (clients) => {
    return Promise.all(
      clients.map(client => client.connect())
    ).catch(this.logging);
  }

/**
  *
  * Given a list of clients, initialize their connections by calling their own connect method.
  * @param {CallableFunction} cb
  * @returns {undefined}
*/
  run = (cb) => {
    this.connectClients(this.dataTargets)
      .then(() => this.connectClients(this.dataSources))
      .then(() => this.collect.runQueries(this.queries))
      .then(this.collect.interlace)
      .then(this.showResults)
      .then(this.digest.saveJSON)
      .then(this.digest.dump)
      .catch(this.logging)
      .then(cb);
  }
}

/**
  * Detects if being called as module, otherwise initializes the app.
  * @TODO delegate initialization to external module consumer
*/
if (require.main === module) {
  new Weaver(require('./config')).run((err) => {
    logging('Done');
    process.exit();
  });
}

module.exports = Weaver;
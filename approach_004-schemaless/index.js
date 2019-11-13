const logging = require('debug');

const WeaverCollect = require('./collect');
const WeaverDigest = require('./digest');

/**
 *
 * @class Weaver
 * @classdesc The main API class
 */
class Weaver {
  /**
   *
   * Consumes the given configuration object and initializes dependencies.
   * @constructor
   * @param {Object} config - The configuration `Object`.
   * @param {Array.<Object>} config.queries
   * @param {Array.<WeaverMongoClient>} config.dataClients
   * @param {Object} config.jsonConfig
   * @param {string} config.jsonConfig.filePath
   * @returns {this} this
   */
  constructor(config) {
    this.__cache = {};
    this.collect = new WeaverCollect(config);
    this.digest = new WeaverDigest(config);
    return this._configure(config);
  }

  /**
   *
   * Assigns the configuration `Object` values to class properties.
   * @param {Object} config - The configuration `Object`.
   * @param {Array.<Object>} config.queries
   * @param {Array.<WeaverMongoClient>} config.dataClients
   * @param {Object} config.jsonConfig
   * @param {string} config.jsonConfig.filePath
   * @returns {this} this
   */
  _configure(config) {
    this.logging = logging('Weaver');
    this.queries = config.queries;
    this.dataClients = config.dataClients;
    this.jsonConfig = config.jsonConfig;
    this.dataSources = this.dataClients.filter((client) => client.config.type === 'source');
    this.dataTargets = this.dataClients.filter((client) => client.config.type === 'target');
    return this;
  }

  /**
   *
   * Given a results object, uses the standad output to print the results.
   * @param {Object} results
   * @returns {Promise.<Object>} A `Promise` resolution carrying the original `results` argument.
   */
  showResults = (results) => {
    const dataEntries = Object.keys(results);
    this.logging(`Found interlaced dataEntries: ${dataEntries.join(', ')}`);
    this.logging(`Total dataEntries: ${dataEntries.length}`);
    return Promise.resolve(results);
  }

  /**
   *
   * Initializes each of the `clients` connections by calling their own `connect method.
   * @param {Array.<WeaverMongoClient>} clients - List of `WeaverMongoClient` isntances.
   * @returns {Promise.<Object>} A `Promise` resolution of all connections.
   */
  connectClients = (clients) => {
    const results = clients.map((client) => client.connect());
    return Promise.all(results).catch(this.logging);
  }

  /**
   * Runs the whole program.
   *
   * Once `this.dataTargets` & `this.dataSources` have connected successfully, it
   * "warms up" by running the initial client queries (`this.queries`) against
   * `this.dataSources`, by calling `this.collect.runQueries` The resulting data is
   * handed over to `this.collect.interlace`.
   *
   * `this.collect.interlace` is recursive. The exit results are passed to
   * `this.showResults` to print out stats.
   *
   * `this.digest` then takes care of saving the output in JSON format and
   * dumping the data into the configured `this.dataTargets`.
   *
   * The rest is just poorly executed error catching.
   *
   * @param {CallableFunction} cb - The callback function to execute on completion.
   * @param {Array} results - If an insertion oparation was executed, it will return
   *  the document or documents insertion results.
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
    if (err) logging(err);
    if (err) throw err;
    logging('Done');
    process.exit();
  });
}

module.exports = Weaver;

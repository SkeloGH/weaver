"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
    _defineProperty(this, "showResults", results => {
      const dataEntries = Object.keys(results);
      this.logging(`Found interlaced dataEntries: ${dataEntries.join(', ')}`);
      this.logging(`Total dataEntries: ${dataEntries.length}`);
      return Promise.resolve(results);
    });

    _defineProperty(this, "connectClients", clients => {
      const results = clients.map(client => client.connect());
      return Promise.all(results).catch(this.logging);
    });

    _defineProperty(this, "disconnect", async cb => {
      const onClose = onCloseCb => {
        let count = 0;
        const numClients = this.dataClients.length;
        return err => {
          count += 1;

          if (count === numClients) {
            onCloseCb(err);
          }
        };
      };

      const closeCb = onClose(cb);
      await this.dataClients.forEach(async client => {
        await client.disconnect(true, closeCb);
      });
      this.logging(`disconnected ${this.dataClients.length} clients...`);
    });

    _defineProperty(this, "run", cb => {
      this.connectClients(this.dataTargets).then(() => this.connectClients(this.dataSources)).then(() => this.collect.runQueries(this.queries)).then(this.collect.interlace).then(this.showResults).then(this.digest.saveJSON).then(this.digest.dump).catch(this.logging).then(cb);
    });

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
    this.dataSources = this.dataClients.filter(client => client.config.type === 'source');
    this.dataTargets = this.dataClients.filter(client => client.config.type === 'target');
    return this;
  }
  /**
   *
   * Given a results object, uses the standad output to print the results.
   * @param {Object} results
   * @returns {Promise.<Object>} A `Promise` resolution carrying the original `results` argument.
   */


}
/**
 * Detects if being called as module, otherwise initializes the app.
 * @TODO delegate initialization to external module consumer
 */


if (require.main === module) {
  const weaver = new Weaver(require('./config'));
  weaver.run(result => {
    logging('Result', result);
    logging('Done');
    weaver.disconnect(process.exit);
  });
}

module.exports = Weaver;
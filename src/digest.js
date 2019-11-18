const fs = require('fs');
const logging = require('debug');
const ldColl = require('lodash/collection');
const ldLang = require('lodash/lang');

const ld = {
  collection: ldColl,
  lang: ldLang,
};

/**
 * @class WeaverDigest
 * @classdesc Data persistence interface for Weaver
 */
class WeaverDigest {
  /**
   * Consumes the given configuration object and initializes dependencies.
   * @constructor
   * @param {Object} config - The cass configuration object
   * @param {Array.<WeaverMongoClient>} config.dataClients - Instances of the clients to
   * run the queries on.
   * @returns {this} - instance of WeaverDigest
   */
  constructor(config) {
    this.__cache = {};
    return this._configure(config);
  }

  /**
   *
   * Splits `config` into `this` class properties.
   * @param {Object} config - The class configuration object
   * @param {Array.<WeaverMongoClient>} config.dataClients - Instances of the clients to
   * run the queries on.
   * @returns {this} - instance of WeaverDigest
   */
  _configure(config) {
    this.logging = logging('WeaverDigest');
    this.dataClients = config.dataClients;
    this.jsonConfig = config.jsonConfig;
    this.dataSources = this.dataClients.filter((client) => client.config.type === 'source');
    this.dataTargets = this.dataClients.filter((client) => client.config.type === 'target');
    return this;
  }

  /**
   * Maps `this.dataTargets` against `this.dataSources` to ensure every data source
   * has a destination.
   * @todo - make it optional, as only saving as JSON could become an option in the future.
   * @returns {Boolean} - whether the configurtion is valid or not.
   */
  validate() {
    const validation = {};
    const unreferenced = this.dataTargets.filter((client) => !client.config.origin);
    const sourceDbs = this.dataSources.map((client) => client.config.db.name);
    const originDbs = this.dataTargets.map((client) => client.config.origin);

    if (unreferenced.length > 0) {
      validation.error = 'Error: There are dataTargets without "origin" assignment.';
      return validation;
    }

    if (!ld.lang.isEqual(sourceDbs, originDbs)) {
      validation.error = 'Error: Different dataTargets and dataSources assignment.';
      validation.error += `\n\tsourceDbs: ${sourceDbs} \n\toriginDbs ${originDbs}`;
      return validation;
    }

    validation.success = true;

    return validation;
  }

  /**
   * Takes in the query results, classifies them by their source database and hands them
   * over to the `digest` data-persistence method.
   * @param {Array} results - The final results of querying the data sources.
   * @returns {Promise<Array>} - The persisted data entries.
   */
  dump = (results) => {
    const targetDbs = this.dataTargets.map((client) => client.config.db.name);
    const validation = this.validate();
    const resultsByDb = ld.collection.groupBy(results, (res) => res.database);

    if (validation.error) return Promise.reject(validation.error);

    this.logging(`Target dbs are: ${targetDbs.join(', ')}`);
    const dumpResults = Object.keys(resultsByDb)
      .map((dbName) => this.digest(dbName, resultsByDb));

    return Promise.all(dumpResults);
  }

  /**
   * Persists the given `resultsByDb` by calling the `digest` method on the
   * matching `dbName` in `this.dataTargets`.
   * @param {String} dbName - The data client name where data will be saved into.
   * @param {Array<Object>} resultsByDb - The data to be persisted on each db.
   * @returns {Promise<Array>} - The persisted data entries.
   */
  digest = (dbName, resultsByDb) => {
    const client = ld.collection.find(this.dataTargets, (tgt) => tgt.config.origin === dbName);
    const dbContent = resultsByDb[dbName];
    return client.digest(dbContent);
  }

  /**
   * Writes the query results into the configured JSON file.
   * @param {Array} results - The final results of querying the data sources.
   * @returns {Promise<Array>} - The persisted data entries.
   */
  saveJSON = (results) => {
    const fileContent = JSON.stringify(results, null, 2);
    if (!this.jsonConfig || !Object.keys(this.jsonConfig).length) {
      Promise.resolve(results);
    }

    this.logging(`Saving to: ${this.jsonConfig.filePath}`);
    fs.writeFileSync(this.jsonConfig.filePath, fileContent, 'utf8');
    return Promise.resolve(results);
  }
}

module.exports = WeaverDigest;

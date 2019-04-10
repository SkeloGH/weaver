const logging  = require('debug');
const ld       = {
  array: require('lodash/array'),
  object: require('lodash/object'),
};

/**
 * @class WeaverCollect
 * @classdesc Data gathering interface for Weaver
 */
class WeaverCollect {
  /**
   *
   * Consumes the given configuration object and initializes dependencies.
   * @constructor
   * @param {Object} config
   * @param {Array.<WeaverMongoClient>} config.dataClients
   * @returns {this} instance of WeaverCollect
   */
  constructor(config) {
    this.__cache     = {};
    return this._configure(config);
  }

  /**
   *
   * Given the list of `dataClients` in `config`, filters out the ones with `type` `'source'` and assigns them to `dataClients` class property.
   * @param {Object} config
   * @param {Array.<WeaverMongoClient>} config.dataClients
   * @returns {this} WeaverCollect instance
   */
  _configure(config) {
    this.logging     = logging(`WeaverCollect`);
    this.dataClients = config.dataClients;
    this.dataSources = this.dataClients.filter(client => client.config.type === 'source');
    return this;
  }

  /**
   *
   * Iterates over each `result` in `results`, checking if its `_id` key has been cached already, if true, the `result` is filtered, leaving in only the ones that weren't already cached.
   * @param {Array.<Object>} results - A list of result objects
   * @returns {Array} Filtered `results`.
   */
  unCachedResults = (results) => {
    return results.filter(result => {
      const cacheKey = result.data._id;
      return !this.__cache[cacheKey];
    });
  }

  /**
   *
   * Saves the given `result` `Object` in the current instance `cache` by the `result` `_id` key.
   * @param {Object} result - A cacheable `Object`.
   * @param {string} result._id - The cacheable `Object` identifier key.
   * @returns {Object} The cached `Object`.
   */
  cacheResult = (result) => {
    const cacheKey = result.data._id;
    if (!this.__cache[cacheKey]) {
      this.__cache[cacheKey] = result;
    }
    return this.__cache[cacheKey];
  }

  /**
   *
   * Stores in `this.__cache` the result of flattening `results`, by each `result`'s `data._id` field.
   * @param {Array.<Object>} results - A list of cacheable `Object`s.
   * @param {string} result._id - The cacheable `Object` identifier key.
   * @returns {Object} The cached `Object`.
   */
  cacheResults = (results) => {
    const flatResults = ld.array.flattenDeep(results);
    flatResults.forEach(this.cacheResult);
    return Promise.resolve(this.__cache);
  }

  interlace = (results) => {
    let idsInDoc = [];
    let queries = [];
    const flatResults = ld.array.flattenDeep(results);
    const unCachedResults = this.unCachedResults(flatResults);

    if (unCachedResults.length === 0) {
      return Promise.resolve(this.__cache);
    }

    this.cacheResults(unCachedResults);

    this.dataSources.forEach(client => {
      idsInDoc = idsInDoc.concat(client.idsInDoc(unCachedResults));
    });

    idsInDoc = ld.array.uniq(idsInDoc);

    this.dataSources.forEach(client => {
      queries = queries.concat(client.idsToQuery(idsInDoc));
    });

    return this.runQueries(queries)
      .then(this.interlace);
  }

  queryClient = (query, client) => {
    this.logging(`Running query ${JSON.stringify(query)} on: ${client.config.db.name}`);
    return client.query(query);
  }

  runQuery = (query) => {
    return Promise.all(
      this.dataSources.map(client => this.queryClient(query, client))
    ).catch(this.logging)
  }

  runQueries = (queries) => {
    return Promise.all(queries.map(this.runQuery)).catch(this.logging)
  }
}

module.exports = WeaverCollect;
const logging = require('debug');
const ldArray = require('lodash/array');
const ldObject = require('lodash/object');

const ld = {
  array: ldArray,
  object: ldObject,
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
    this.__cache = {};
    return this._configure(config);
  }

  /**
   *
   * Given the list of `dataClients` in `config`, filters out the ones with `type` `'source'` and
   * assigns them to `this.dataSources`.
   * @param {Object} config - the configuration object
   * @param {Array.<WeaverMongoClient>} config.dataClients - Instances of the clients
   * to run the queries on.
   * @returns {this} WeaverCollect instance
   */
  _configure(config) {
    this.logging = logging('WeaverCollect');
    // this.dataClients = config.dataClients;
    this.dataSources = config.dataClients.filter((client) => client.config.type === 'source');
    return this;
  }

  /**
   *
   * Iterates over each `result` in `results`, checking if its `_id` key has been cached already,
   * if true, the `result` is filtered, leaving in only the ones that weren't already cached.
   * @param {Array.<Object>} results - A list of result objects
   * @returns {Array} Filtered `results`.
   */
  unCachedResults = (_results) => {
    const results = _results.filter((result) => {
      const cacheKey = result.data._id;
      return !this.__cache[cacheKey];
    });
    return results;
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
   * Stores in `this.__cache` the result of flattening `results`, by each
   * `result`'s `data._id` field.
   * @param {Array<Object>} results - A list of cacheable `Object`s.
   * @param {string} result._id - The cacheable `Object` identifier key.
   * @returns {Object} The cached `Object`.
   */
  cacheResults = (results) => {
    const flatResults = ld.array.flattenDeep(results);
    flatResults.forEach(this.cacheResult);
    return Promise.resolve(this.__cache);
  }

  /**
   * The core logic for collecting data.
   * Stores the results in memory.
   * Exits when no new results are cached.
   *
   * Flattens the `results` structure in order to check if they
   * have been already cached.
   *
   * `unCachedResults` are then stored in the local cache.
   *
   * Every `result` in `unCachedResults` is examined for references to other documents.
   *
   * The resultant, unique ids are then converted into new `queries`. These are run
   * on every `this.dataSources` DB client, the `results` of that query is passed on recursively.
   * @param {Array<Object>} results - the output of running the queries against the DB clients.
   * @returns {Array<Object>} The complete data set after running all the interlaced queries.
   */
  interlace = (results) => {
    let idsInDoc = [];
    let queries = [];
    const flatResults = ld.array.flattenDeep(results);
    const unCachedResults = this.unCachedResults(flatResults);

    if (unCachedResults.length === 0) {
      return Promise.resolve(this.__cache);
    }

    this.cacheResults(unCachedResults);

    this.dataSources.forEach((client) => {
      idsInDoc = idsInDoc.concat(client.idsInDoc(unCachedResults));
    });

    idsInDoc = ld.array.uniq(idsInDoc);

    this.dataSources.forEach((client) => {
      queries = queries.concat(client.idsToQuery(idsInDoc));
    });

    return this.runQueries(queries)
      .then(this.interlace);
  }

  /**
   * Runs the given `query` against the given `client`.
   * @param {Object} query - The query in JSON format.
   * @param {WeaverMongoClient} client - The DB client instance.
   */
  queryClient = (query, client) => {
    this.logging(`Running query against ${client.config.db.name} DB: ${JSON.stringify(query, null, 2)}`);
    return client.query(query);
  }

  /**
   * Runs the given `query` against all the configured `this.dataSources`.
   * @param {Object} query - The query in JSON format.
   */
  runQuery = (query) => {
    const queries = this.dataSources.map((client) => this.queryClient(query, client));
    return Promise.all(queries).catch(this.logging);
  }

  /**
   * Runs all the given `queries` against all the configured `this.dataSources`.
   * @param {Array<Object>} queries - The list of queries to be run.
   */
  runQueries = (queries) => Promise.all(queries.map(this.runQuery)).catch(this.logging)
}

module.exports = WeaverCollect;

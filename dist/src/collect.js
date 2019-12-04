"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const logging = require('debug');

const ldArray = require('lodash/array');

const ldObject = require('lodash/object');

const ld = {
  array: ldArray,
  object: ldObject
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
    _defineProperty(this, "unCachedResults", _results => {
      const results = _results.filter(result => {
        const cacheKey = result.data._id;
        return !this.__cache[cacheKey];
      });

      return results;
    });

    _defineProperty(this, "cacheResult", result => {
      const cacheKey = result.data._id;

      if (!this.__cache[cacheKey]) {
        this.__cache[cacheKey] = result;
      }

      return this.__cache[cacheKey];
    });

    _defineProperty(this, "cacheResults", results => {
      const flatResults = ld.array.flattenDeep(results);
      flatResults.forEach(this.cacheResult);
      return Promise.resolve(this.__cache);
    });

    _defineProperty(this, "interlace", results => {
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
      return this.runQueries(queries).then(this.interlace);
    });

    _defineProperty(this, "queryClient", (query, client) => {
      this.logging(`Running query against ${client.config.db.name} DB: ${JSON.stringify(query, null, 2)}`);
      return client.query(query);
    });

    _defineProperty(this, "runQuery", query => {
      const queries = this.dataSources.map(client => this.queryClient(query, client));
      return Promise.all(queries).catch(this.logging);
    });

    _defineProperty(this, "runQueries", queries => Promise.all(queries.map(this.runQuery)).catch(this.logging));

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
    this.logging = logging('WeaverCollect'); // this.dataClients = config.dataClients;

    this.dataSources = config.dataClients.filter(client => client.config.type === 'source');
    return this;
  }
  /**
   *
   * Iterates over each `result` in `results`, checking if its `_id` key has been cached already,
   * if true, the `result` is filtered, leaving in only the ones that weren't already cached.
   * @param {Array.<Object>} results - A list of result objects
   * @returns {Array} Filtered `results`.
   */


}

module.exports = WeaverCollect;
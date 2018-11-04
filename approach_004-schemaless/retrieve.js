const fs       = require('fs');
const async    = require('async');
const logging  = require('debug');
const ld       = {
  array: require('lodash/array'),
  object: require('lodash/object'),
};

class Retrieve {
  constructor(config) {
    this.__cache     = {};
    return this._configure(config)._bindings();
  }

  _configure(config) {
    this.logging     = logging(`Retrieve`);
    this.dataClients = config.dataClients;
    this.dataSources = this.dataClients.filter(client => client.config.type === 'source');
    return this;
  }

  _bindings() {
    /** TODO: auto-bind all methods */
    this.cacheResult     = this.cacheResult.bind(this);
    this.cacheResults    = this.cacheResults.bind(this);
    this.interlace       = this.interlace.bind(this);
    this.logging         = this.logging.bind(this);
    this.queryClient     = this.queryClient.bind(this);
    this.runQueries      = this.runQueries.bind(this);
    this.runQuery        = this.runQuery.bind(this);
    this.unCachedResults = this.unCachedResults.bind(this);
    return this;
  }

  unCachedResults(results) {
    return results.filter(result => {
      const cacheKey = result.data._id;
      return !this.__cache[cacheKey];
    });
  }

  cacheResult(result) {
    const cacheKey = result.data._id;
    if (!this.__cache[cacheKey]) {
      this.__cache[cacheKey] = result;
    }
    return this.__cache[cacheKey];
  }

  cacheResults(results) {
    const flatResults = ld.array.flattenDeep(results);
    flatResults.forEach(this.cacheResult);
    return Promise.resolve(this.__cache);
  }

  interlace(results) {
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

  connectClients(clients) {
    return Promise.all(
      clients.map(client => client.connect())
    ).catch(this.logging)
  }

  queryClient(query, client) {
    this.logging(`Running query ${JSON.stringify(query)} on: ${client.config.db.name}`);
    return client.query(query);
  }

  runQuery(query) {
    return Promise.all(
      this.dataSources.map(client => this.queryClient(query, client))
    ).catch(this.logging)
  }

  runQueries(queries) {
    return Promise.all(queries.map(this.runQuery)).catch(this.logging)
  }
}

module.exports = Retrieve;
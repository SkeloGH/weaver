const fs       = require('fs');
const async    = require('async');
const logging  = require('debug');
const ld       = {
  array: require('lodash/array'),
  object: require('lodash/object'),
};

class Weaver {
  constructor(config) {
    return this._configure(config)._bindings();
  }

  _configure(config) {
    this.logging     = logging(`Weaver`);
    this.__cache     = {};
    this.queries     = config.queries;
    this.dataClients = config.dataClients;
    this.jsonConfig  = config.jsonConfig;
    this.dataSources = this.dataClients.filter(client => client.config.type === 'source');
    this.dataTargets = this.dataClients.filter(client => client.config.type === 'target');
    return this;
  }

  _bindings() {
    /** TODO: auto-bind all methods */
    this.cacheResult     = this.cacheResult.bind(this);
    this.cacheResults    = this.cacheResults.bind(this);
    this.dump            = this.dump.bind(this);
    this.interlace       = this.interlace.bind(this);
    this.logging         = this.logging.bind(this);
    this.queryClient     = this.queryClient.bind(this);
    this.runQueries      = this.runQueries.bind(this);
    this.runQuery        = this.runQuery.bind(this);
    this.saveJSON        = this.saveJSON.bind(this);
    this.showResults     = this.showResults.bind(this);
    this.unCachedResults = this.unCachedResults.bind(this);
    return this;
  }

  dump(results) {
    return new Promise((resolve, reject) => {
      const targetDbs = this.dataTargets.map(client => client.config.db.name);
      this.logging(`Target dbs are ${targetDbs}`);
      resolve();
    }).catch(this.logging)
  }

  saveJSON(results) {
    return new Promise((resolve, reject) => {
      if (!this.jsonConfig || !Object.keys(this.jsonConfig).length) resolve(results);
      const fileContent = JSON.stringify(results, null, 2);

      fs.writeFile(this.jsonConfig.filePath, fileContent, 'utf8', (err) => {
        this.logging(`saved to: ${this.jsonConfig.filePath}`);
        resolve(results);
      });
    }).catch(this.logging)
  }

  showResults(results) {
    return new Promise((resolve, reject) => {
      const dataEntries = Object.keys(results);
      this.logging(`Found interlaced dataEntries: ${dataEntries.join(', ')}`);
      this.logging(`Total dataEntries: ${dataEntries.length}`);
      resolve(results);
    }).catch(this.logging)
  }

  unCachedResults(results) {
    return results.filter(result => {
      const cacheKey = result.data._id;
      return !this.__cache[cacheKey];
    })
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
    const flatResults = ld.array.flattenDeep(results);
    const unCachedResults = this.unCachedResults(flatResults);

    if (unCachedResults.length === 0) {
      return Promise.resolve(this.__cache);
    }

    this.cacheResults(unCachedResults);

    return new Promise((resolve, reject) => {
      let idsInDoc = [];
      let queries = [];
      /**
        1. retrieve unique ids
      */
      this.dataSources.forEach(client => {
        idsInDoc = idsInDoc.concat(client.idsInDoc(unCachedResults));
      });

      idsInDoc = ld.array.uniq(idsInDoc)
      /**
        2. generate queries
      */
      this.dataSources.forEach(client => {
        queries = queries.concat(client.idsToQuery(idsInDoc));
      });
      /**
        3. run queries
      */
      this.runQueries(queries)
        .then(this.interlace)
          .then(resolve);
    }).catch(this.logging);
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

  run(cb) {

    this.connectClients(this.dataSources)
      .then(() => this.runQueries(this.queries))
        .then(this.interlace)
          .then(this.showResults)
            .then(this.saveJSON)
              .then(this.dump)
                .then(cb);

  }
}

/** @TODO detect if running as module or expect query in script arguments */
if (require.main === module) {
  new Weaver(require('./config')).run((err) => {
    logging('Done');
    process.exit()
  });
}

//
// const install = (result, database, targetDb, cb) => {
//   const collections = Object.keys(result);
//   let idx = 0;
//   let installAll = false;
//   let skipAll = false;

//   async.eachLimit(collections, 1, (collection, eCb) => {
//     const docsById = result[collection];
//     const docs = Object.keys(docsById).map(docId => docsById[docId]);
//     const inputOptions = ['[y]es','[n]o','[a]ll','[v]iew','[q]uit'].join(' ');
//     const message = ['\n','add',docs.length,'docs to',collection,'-',inputOptions,': '].join(' ');
//     idx++;

//     if (installAll) return targetDb.collection(collection).insertMany(docs, eCb);
//     if (skipAll) return eCb()

//     prompt(message, (err, answer) => {
//       installAll = answer == 'a';
//       skipAll = answer == 'q';
//       const shouldInstall = installAll || answer == 'y';
//       const view = answer == 'v';

//       if (shouldInstall) {
//         return targetDb.collection(collection).insertMany(docs, eCb);
//       } else if (view) {
//         console.log('\n\n' + JSON.stringify(docs, null, 2));
//       }
//       return eCb();
//     });
//   }, err => {
//     database.close()
//     if (err) return cb(err, result[collections[idx]] );
//     return cb();
//   });
// }

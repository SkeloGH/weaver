const fs       = require('fs');
const async    = require('async');
const logging  = require('debug');

class Weaver {
  constructor(config) {
    return this._configure(config)._bindings();
  }

  _configure(config) {
    this.logging     = logging(`Weaver`);
    this.queries     = config.queries;
    this.dataClients = config.dataClients;
    this.jsonConfig  = config.jsonConfig;
    this.dataSources = this.dataClients.filter(client => client.config.type === 'source');
    this.dataTargets = this.dataClients.filter(client => client.config.type === 'target');
    return this;
  }

  _bindings() {
    this.dump        = this.dump.bind(this);
    this.interlace   = this.interlace.bind(this);
    this.logging     = this.logging.bind(this);
    this.queryClient = this.queryClient.bind(this);
    this.runQueries  = this.runQueries.bind(this);
    this.runQuery    = this.runQuery.bind(this);
    this.saveJSON    = this.saveJSON.bind(this);
    this.showResults = this.showResults.bind(this);
    this.uniques     = this.uniques.bind(this);
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
      this.logging(`showResults results.length ${results.length}`);
      const collections = Object.keys(results);
      this.logging(`Found interlaced collections: ${collections.join('/n')}`);
      resolve(results);
    }).catch(this.logging)
  }

  interlace(results) {
    return new Promise((resolve, reject) => {
      this.logging(`TODO ==== unpack results ====`);
      let idsInDoc = [];
      let queries = [];
      /**
        1. retrieve unique ids
      */
      this.dataSources.forEach(client => {
        idsInDoc = idsInDoc.concat(client.idsInDoc(results));
      });
      idsInDoc = this.uniques(idsInDoc);
      /**
        2. generate queries
      */
      this.dataSources.forEach(client => {
        queries = queries.concat(client.idsToQuery(idsInDoc));
      });
      this.logging(queries);

      /**
        3. run queries
      */
      this.runQueries(queries)
      // resolve(results);
    }).catch(this.logging);
  }

  uniques(list) {
    const dict = {};
    list.forEach(item => {
      let key = typeof item === 'string' ? item : JSON.stringify(item);
      dict[key] = 0
    });
    return Object.keys(dict);
  }

  showResults(results) {
    return new Promise((resolve, reject) => {
      logging(results.length);
      const collections = Object.keys(results);
      logging(`Found interlaced collections: ${collections.join('/n')}`);
      resolve(results);
    }).catch(logging)
  }

  interlace(results) {
    return new Promise((resolve, reject) => {
      logging(`TODO ==== unpack results ====`);
      let idsInDoc = [];
      this.dataSources.forEach(client => {
        idsInDoc = idsInDoc.concat(client.idsInDoc(results));
      });
      idsInDoc = this.uniques(idsInDoc);
      logging(JSON.stringify(idsInDoc));
      resolve(results);
    }).catch(logging);
  }

  uniques(list) {
    const dict = {};
    list.forEach(item => {dict[item] = 0})
    return Object.keys(dict);
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
        // .then(this.interlace)
          .then(this.showResults)
            .then(this.saveJSON)
              .then(this.dump)
                .then(cb);

  }
}

/** @TODO detect if running as module or expect query in script arguments */
new Weaver(require('./config')).run((err) => {
  logging('Done');
  process.exit()
});



// const interlace = (database, cb) => {
//   const sourceDb = database.db(CFG.dbName.source);
//   const config = {
//     db: sourceDb,
//     collection: CFG.collectionName,
//     id: CFG.documentId,
//     collectionMappings: CFG.collectionMappings,
//   };
//   const weaver = new Weaver(config);
//   weaver.interlace(config.collection, config.id, (err, result) => {
//     database.close();
//     return cb(err, result);
//   });
// };
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

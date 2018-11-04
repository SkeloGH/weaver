const fs       = require('fs');
const async    = require('async');
const logging  = require('debug');
const ld       = {
  array: require('lodash/array'),
  object: require('lodash/object'),
};

const WeaverCollect = require('./collect');

class Weaver {
  constructor(config) {
    this.__cache = {};
    this.collect = new WeaverCollect(config);
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
    this.dump            = this.dump.bind(this);
    this.logging         = this.logging.bind(this);
    this.saveJSON        = this.saveJSON.bind(this);
    this.showResults     = this.showResults.bind(this);
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

  run(cb) {
    this.collect.connectClients(this.dataSources)
      .then(() => this.collect.runQueries(this.queries))
      .then(this.collect.interlace)
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
    process.exit();
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

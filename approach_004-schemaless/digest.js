const fs       = require('fs');
const async    = require('async');
const logging  = require('debug');
const ld       = {
  array: require('lodash/array'),
  lang: require('lodash/lang'),
};


class WeaverDigest {
  constructor(config) {
    this.__cache = {};
    return this._configure(config);
  }

  _configure(config) {
    this.logging     = logging(`WeaverDigest`);
    this.queries     = config.queries;
    this.dataClients = config.dataClients;
    this.jsonConfig  = config.jsonConfig;
    this.dataSources = this.dataClients.filter(client => client.config.type === 'source');
    this.dataTargets = this.dataClients.filter(client => client.config.type === 'target');
    return this;
  }

  validate() {
    const result = {};
    const unreferenced = this.dataTargets.filter(client => !client.config.origin);
    const sourceDbs = this.dataSources.map(client => client.config.db.name);
    const originDbs = this.dataTargets.map(client => client.config.origin);

    if (unreferenced.length > 0) {
      result.error = 'Error: There are dataTargets without \"origin\" assignment.';
      return result
    }

    if (!ld.lang.isEqual(sourceDbs, originDbs)) {
      result.error = `Error: Different dataTargets and dataSources assignment.`;
      result.error += `\n\tsourceDbs: ${sourceDbs} \n\toriginDbs ${originDbs}`;
      return result
    }

    result.success = true;

    return result
  }

  dump = (results) => {
    const targetDbs = this.dataTargets.map(client => client.config.db.name);
    const validation = this.validate();
    if (validation.success) {
      this.logging(`Target dbs are: ${targetDbs.join(', ')}`);
      return Promise.resolve(results);
    }
    return Promise.reject(validation.error);
  }

  saveJSON = (results) => {
    if (!this.jsonConfig || !Object.keys(this.jsonConfig).length) {
      Promise.resolve(results);
    }
    const fileContent = JSON.stringify(results, null, 2);

    this.logging(`Saving to: ${this.jsonConfig.filePath}`);
    fs.writeFileSync(this.jsonConfig.filePath, fileContent, 'utf8');
    Promise.resolve(results);
  }

}

module.exports = WeaverDigest;

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

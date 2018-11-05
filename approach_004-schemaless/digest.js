const fs       = require('fs');
const async    = require('async');
const logging  = require('debug');
const ld       = {
  collection: require('lodash/collection'),
  lang: require('lodash/lang'),
};


class WeaverDigest {
  constructor(config) {
    this.__cache = {};
    return this._configure(config);
  }

  _configure(config) {
    this.logging     = logging(`WeaverDigest`);
    this.dataClients = config.dataClients;
    this.jsonConfig  = config.jsonConfig;
    this.dataSources = this.dataClients.filter(client => client.config.type === 'source');
    this.dataTargets = this.dataClients.filter(client => client.config.type === 'target');
    return this;
  }

  validate() {
    const validation = {};
    const unreferenced = this.dataTargets.filter(client => !client.config.origin);
    const sourceDbs = this.dataSources.map(client => client.config.db.name);
    const originDbs = this.dataTargets.map(client => client.config.origin);

    if (unreferenced.length > 0) {
      validation.error = 'Error: There are dataTargets without \"origin\" assignment.';
      return validation;
    }

    if (!ld.lang.isEqual(sourceDbs, originDbs)) {
      validation.error = `Error: Different dataTargets and dataSources assignment.`;
      validation.error += `\n\tsourceDbs: ${sourceDbs} \n\toriginDbs ${originDbs}`;
      return validation;
    }

    validation.success = true;

    return validation;
  }

  dump = (results) => {
    let dumpResults;
    const targetDbs = this.dataTargets.map(client => client.config.db.name);
    const validation = this.validate();
    const resultsByDb = ld.collection.groupBy(results, res => res.database);

    if (validation.error) return Promise.reject(validation.error);

    this.logging(`Target dbs are: ${targetDbs.join(', ')}`);
    dumpResults = Object.keys(resultsByDb).map(dbName => {
      return this.digest(dbName, resultsByDb);
    });

    return Promise.all(dumpResults);
  }

  digest = (dbName, resultsByDb) => {
    const client = ld.collection.find(this.dataTargets, tgt => tgt.config.origin == dbName);
    const dbContent = resultsByDb[dbName];
    return client.digest(dbContent);
  }

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


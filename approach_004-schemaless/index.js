const fs       = require('fs');
const async    = require('async');
const logging  = require('debug');
const ld       = {
  array: require('lodash/array'),
  object: require('lodash/object'),
};

const WeaverCollect = require('./collect');
const WeaverDigest = require('./digest');

class Weaver {
  constructor(config) {
    this.__cache = {};
    this.collect = new WeaverCollect(config);
    this.digest  = new WeaverDigest(config);
    return this._configure(config);
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

  showResults = (results) => {
    const dataEntries = Object.keys(results);
    this.logging(`Found interlaced dataEntries: ${dataEntries.join(', ')}`);
    this.logging(`Total dataEntries: ${dataEntries.length}`);
    return Promise.resolve(results);
  }

  connectClients = (clients) => {
    return Promise.all(
      clients.map(client => client.connect())
    ).catch(this.logging)
  }

  run = (cb) => {
    this.connectClients(this.dataTargets)
      .then(() => this.connectClients(this.dataSources))
      .then(() => this.collect.runQueries(this.queries))
      .then(this.collect.interlace)
      .then(this.showResults)
      .then(this.digest.saveJSON)
      .then(this.digest.dump)
      .catch(this.logging)
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

module.exports = Weaver;
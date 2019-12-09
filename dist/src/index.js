"use strict";function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}const logging=require("debug"),WeaverCollect=require("./collect"),WeaverDigest=require("./digest");/**
 *
 * @class Weaver
 * @classdesc The main API class
 */class Weaver{/**
   *
   * Consumes the given configuration object and initializes dependencies.
   * @constructor
   * @param {Object} config - The configuration `Object`.
   * @param {Array.<Object>} config.queries
   * @param {Array.<WeaverMongoClient>} config.dataClients
   * @param {Object} config.jsonConfig
   * @param {string} config.jsonConfig.filePath
   * @returns {this} this
   */constructor(a){return _defineProperty(this,"showResults",a=>{const b=Object.keys(a);return this.logging(`Found interlaced dataEntries: ${b.join(", ")}`),this.logging(`Total dataEntries: ${b.length}`),Promise.resolve(a)}),_defineProperty(this,"connectClients",a=>{const b=a.map(a=>a.connect());return Promise.all(b).catch(this.logging)}),_defineProperty(this,"disconnect",async a=>{const b=(a=>{let b=0;const c=this.dataClients.length;return d=>{b+=1,b===c&&a(d)}})(a);await this.dataClients.forEach(async a=>{await a.disconnect(!0,b)}),this.logging(`disconnected ${this.dataClients.length} clients...`)}),_defineProperty(this,"run",a=>{this.connectClients(this.dataTargets).then(()=>this.connectClients(this.dataSources)).then(()=>this.collect.runQueries(this.queries)).then(this.collect.interlace).then(this.showResults).then(this.digest.saveJSON).then(this.digest.dump).catch(this.logging).then(a)}),this.__cache={},this.collect=new WeaverCollect(a),this.digest=new WeaverDigest(a),this._configure(a)}/**
   *
   * Assigns the configuration `Object` values to class properties.
   * @param {Object} config - The configuration `Object`.
   * @param {Array.<Object>} config.queries
   * @param {Array.<WeaverMongoClient>} config.dataClients
   * @param {Object} config.jsonConfig
   * @param {string} config.jsonConfig.filePath
   * @returns {this} this
   */_configure(a){return this.logging=logging("Weaver"),this.queries=a.queries,this.dataClients=a.dataClients,this.jsonConfig=a.jsonConfig,this.dataSources=this.dataClients.filter(a=>"source"===a.config.type),this.dataTargets=this.dataClients.filter(a=>"target"===a.config.type),this}/**
   *
   * Given a results object, uses the standad output to print the results.
   * @param {Object} results
   * @returns {Promise.<Object>} A `Promise` resolution carrying the original `results` argument.
   */}/**
 * Detects if being called as module, otherwise initializes the app.
 * @TODO delegate initialization to external module consumer
 */if(require.main===module){const a=new Weaver(require("./config"));a.run(b=>{logging("Result",b),logging("Done"),a.disconnect(process.exit)})}module.exports=Weaver;
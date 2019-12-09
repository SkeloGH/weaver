"use strict";function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}const fs=require("fs"),logging=require("debug"),ldColl=require("lodash/collection"),ldLang=require("lodash/lang"),ld={collection:ldColl,lang:ldLang};/**
 * @class WeaverDigest
 * @classdesc Data persistence interface for Weaver
 */class WeaverDigest{/**
   * Consumes the given configuration object and initializes dependencies.
   * @constructor
   * @param {Object} config - The cass configuration object
   * @param {Array.<WeaverMongoClient>} config.dataClients - Instances of the clients to
   * run the queries on.
   * @returns {this} - instance of WeaverDigest
   */constructor(a){return _defineProperty(this,"dump",a=>{const b=this.dataTargets.map(a=>a.config.db.name),c=this.validate(),d=ld.collection.groupBy(a,a=>a.database);if(c.error)return Promise.reject(c.error);this.logging(`Target dbs are: ${b.join(", ")}`);const e=Object.keys(d).map(a=>this.digest(a,d));return Promise.all(e)}),_defineProperty(this,"digest",(a,b)=>{const c=ld.collection.find(this.dataTargets,b=>b.config.origin===a),d=b[a];return c.digest(d)}),_defineProperty(this,"saveJSON",a=>{const b=JSON.stringify(a,null,2);return this.jsonConfig&&Object.keys(this.jsonConfig).length||Promise.resolve(a),this.logging(`Saving JSON to: ${this.jsonConfig.filePath}`),fs.writeFileSync(this.jsonConfig.filePath,b,"utf8"),Promise.resolve(a)}),this.__cache={},this._configure(a)}/**
   *
   * Splits `config` into `this` class properties.
   * @param {Object} config - The class configuration object
   * @param {Array.<WeaverMongoClient>} config.dataClients - Instances of the clients to
   * run the queries on.
   * @returns {this} - instance of WeaverDigest
   */_configure(a){return this.logging=logging("WeaverDigest"),this.dataClients=a.dataClients,this.jsonConfig=a.jsonConfig,this.dataSources=this.dataClients.filter(a=>"source"===a.config.type),this.dataTargets=this.dataClients.filter(a=>"target"===a.config.type),this}/**
   * Maps `this.dataTargets` against `this.dataSources` to ensure every data source
   * has a destination.
   * @todo - make it optional, as only saving as JSON could become an option in the future.
   * @returns {Boolean} - whether the configurtion is valid or not.
   */validate(){const a={},b=this.dataTargets.filter(a=>!a.config.origin),c=this.dataSources.map(a=>a.config.db.name),d=this.dataTargets.map(a=>a.config.origin);return 0<b.length?(a.error="Error: There are dataTargets without \"origin\" assignment.",a):ld.lang.isEqual(c,d)?(a.success=!0,a):(a.error="Error: Different dataTargets and dataSources assignment.",a.error+=`\n\tsourceDbs: ${c} \n\toriginDbs ${d}`,a)}/**
   * Takes in the query results, classifies them by their source database and hands them
   * over to the `digest` data-persistence method.
   * @param {Array} results - The final results of querying the data sources.
   * @returns {Promise<Array>} - The persisted data entries.
   */}module.exports=WeaverDigest;
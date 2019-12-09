"use strict";function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}const logging=require("debug"),ldArray=require("lodash/array"),ldObject=require("lodash/object"),ld={array:ldArray,object:ldObject};/**
 * @class WeaverCollect
 * @classdesc Data gathering interface for Weaver
 */class WeaverCollect{/**
   *
   * Consumes the given configuration object and initializes dependencies.
   * @constructor
   * @param {Object} config
   * @param {Array.<WeaverMongoClient>} config.dataClients
   * @returns {this} instance of WeaverCollect
   */constructor(a){return _defineProperty(this,"unCachedResults",a=>{const b=a.filter(a=>{const b=a.data._id;return!this.__cache[b]});return b}),_defineProperty(this,"cacheResult",a=>{const b=a.data._id;return this.__cache[b]||(this.__cache[b]=a),this.__cache[b]}),_defineProperty(this,"cacheResults",a=>{const b=ld.array.flattenDeep(a);return b.forEach(this.cacheResult),Promise.resolve(this.__cache)}),_defineProperty(this,"interlace",a=>{let b=[],c=[];const d=ld.array.flattenDeep(a),e=this.unCachedResults(d);return 0===e.length?Promise.resolve(this.__cache):(this.cacheResults(e),this.dataSources.forEach(a=>{b=b.concat(a.idsInDoc(e))}),b=ld.array.uniq(b),this.dataSources.forEach(a=>{c=c.concat(a.idsToQuery(b))}),this.runQueries(c).then(this.interlace))}),_defineProperty(this,"queryClient",(a,b)=>(this.logging(`Running query against ${b.config.db.name} DB: ${JSON.stringify(a,null,2)}`),b.query(a))),_defineProperty(this,"runQuery",a=>{const b=this.dataSources.map(b=>this.queryClient(a,b));return Promise.all(b).catch(this.logging)}),_defineProperty(this,"runQueries",a=>Promise.all(a.map(this.runQuery)).catch(this.logging)),this.__cache={},this._configure(a)}/**
   *
   * Given the list of `dataClients` in `config`, filters out the ones with `type` `'source'` and
   * assigns them to `this.dataSources`.
   * @param {Object} config - the configuration object
   * @param {Array.<WeaverMongoClient>} config.dataClients - Instances of the clients
   * to run the queries on.
   * @returns {this} WeaverCollect instance
   */_configure(a){return this.logging=logging("WeaverCollect"),this.dataSources=a.dataClients.filter(a=>"source"===a.config.type),this}/**
   *
   * Iterates over each `result` in `results`, checking if its `_id` key has been cached already,
   * if true, the `result` is filtered, leaving in only the ones that weren't already cached.
   * @param {Array.<Object>} results - A list of result objects
   * @returns {Array} Filtered `results`.
   */}module.exports=WeaverCollect;
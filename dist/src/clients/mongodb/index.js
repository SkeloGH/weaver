"use strict";function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}const mongo=require("mongodb"),logging=require("debug"),md5=require("md5"),Utils=require("./util"),{MongoClient}=mongo;/**
 * @class WeaverMongoClient A MongoDB client interface for Weaver
*/class WeaverMongoClient extends Utils{/**
 *
 * Consumes the given configuration object and initializes dependencies.
 * @constructor
 * @param {Object} config
 * @param {'source' | 'target'} config.type - the type of db client:
 *  'source' - the client is a data source
 *  'target' - the client is a data target
 * @param {Object} config.db
 * @param {string} config.db.url - the db url address:
 *   example 'mongodb://localhost:27017'
 * @param {string} config.db.name - the client db name:
 *  example 'my-app-store'
 * @param {Object} config.db.options - node-mongodb-native options: http://mongodb.github.io/node-mongodb-native/3.1/reference/connecting/connection-settings/]
 * @param {Object} config.client - WeaverMongoClient-specific configurations:
 * @param {Array.<string>} config.client.ignoreFields - The list of collection names to
 *  avoid querying
 * @return {WeaverMongoClient} this
*/constructor(a){super(a),_defineProperty(this,"_configure",a=>(this.logging=logging(`WeaverMongoClient:${a.db.name}`),this.type=a.type,this.config=a,this.ignoreFields=a.client&&a.client.ignoreFields||[],this.config.db.options.useNewUrlParser=!0,this)),_defineProperty(this,"connect",()=>{const a=this.config.db.url,{options:b}=this.config.db;return this.client=MongoClient,this.logging("Connecting MongoDb client"),this.client.connect(a,b).then(this._onClientConnect)}),_defineProperty(this,"disconnect",(a,b)=>this.database.close(a,b)),_defineProperty(this,"_onClientConnect",a=>(this.database=a,this.db=a.db(this.config.db.name),this.logging("Connection success"),this._fetchCollections())),_defineProperty(this,"_fetchCollections",()=>(this.logging("Listing collections"),this.db.listCollections({},{nameOnly:!0}).toArray().then(this._saveCollections))),_defineProperty(this,"_saveCollections",a=>(this.collections=a,this.collNames=a.map(a=>a.name),Promise.resolve(this.collNames))),_defineProperty(this,"query",a=>{const b=this.collNames.map(this._fetchDocument.bind(this,a));return Promise.all(b).catch(this.onError).then(a=>{const b=a.filter(a=>!!a);return Promise.resolve(b)})}),_defineProperty(this,"_fetchDocument",(a,b)=>{const c=md5(JSON.stringify(a)),d=this.__cache[c];return d?Promise.resolve(d):-1<this.ignoreFields.indexOf(b)?Promise.resolve(d):this.db.collection(b).findOne(a).catch(this.onError).then(d=>(d&&(this.logging(`${b}.findOne(${JSON.stringify(a)}):`),this.logging(`  ${JSON.stringify(d,null,2)}`)),this._cacheDocument(c,b,d)))}),_defineProperty(this,"onError",(a,b)=>(b&&this.logging(b,a),this.config.onError&&this.config.onError(a))),_defineProperty(this,"digest",a=>(this.logging("digesting:",a),Promise.all(a.map(this.saveDocument)))),_defineProperty(this,"saveDocument",a=>{const b=a.dataSet,{_id:c}=a.data;return this.db.collection(b).findOne({_id:c}).then(c=>c?this.handleSavedDocument(c):this.db.collection(b).insertOne(a.data))}),_defineProperty(this,"handleSavedDocument",a=>Promise.resolve(a)),this.db=null,this.remote=null,this.collections=[],this.collNames=[],this.__cache={},this._configure(a)}/**
   *
   * Splits `config` into `this` class properties.
   * @param {Object} config - The cass configuration object
   * @param {Array.<WeaverMongoClient>} config.dataClients - Instances of the clients to run
   * the queries on.
   * @returns {this} - instance of WeaverMongoClient
   */ /**
   * @todo Use a const to build the object, then return the const.
   * @returns {Object} - Formatted reference to this db client name and the currently
   * cached results.
   */get data(){return{db:this.config.db.name,results:this.__cache}}/**
   * Displays the given error message and calls the custom error handler, if given.
   * @param {Object} error - The object containing the exception details.
   * @param {String} message - The exception message to be displayed.
   * @returns {any} - The return value of the custom error callback.
   */}module.exports=WeaverMongoClient;
"use strict";function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}const ObjectId=require("bson-objectid"),ldLang=require("lodash/lang"),ld={lang:ldLang};/**
 * @class Util
 * @classdesc Utility class for MongoDB client only.
 * @todo reconsider inheritance
 */class Util{/**
   *
   * Consumes the given configuration object and initializes dependencies.
   * @constructor
   * @param {Object} config - The configuration `Object`.
   * @returns {undefined}
   */constructor(){_defineProperty(this,"_cache",(a,b)=>{this.__cache[a]=b}),_defineProperty(this,"_cacheDocument",(a,b,c)=>{let d;return c&&(d={database:this.config.db.name,dataSet:b,data:c},this._cache(a,d)),Promise.resolve(d)}),_defineProperty(this,"idsInDoc",(a,b)=>{const c=ld.lang.isArray(a),d=ld.lang.isPlainObject(a),e=b||[];return ld.lang.isEmpty(a)?e:(ObjectId.isValid(a.toString())?e.push(a.toString()):c?a.forEach(a=>e.concat(this.idsInDoc(a,e))):d&&Object.keys(a).forEach(b=>{const c=e.concat(this.idsInDoc(a[b],e));return c}),e)}),_defineProperty(this,"idsToQuery",a=>{const b=a.map(a=>{const b={_id:ObjectId(a)};return b});return b}),this.__cache=this.__cache||{}}/**
   *
   * Keeps `data` in memory under the provided `key`.
   * @todo - return the cached entry
   * @param {String|Symbol} key - The key under the data will be cached.
   * @param {any} data - The data to be kept.
   */}module.exports=Util;
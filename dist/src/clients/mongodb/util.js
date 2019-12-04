"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const mongo = require('mongodb');

const ldLang = require('lodash/lang');

const ld = {
  lang: ldLang
};
const {
  ObjectId
} = mongo;
/**
 * @class Util
 * @classdesc Utility class for MongoDB client only.
 * @todo reconsider inheritance
 */

class Util {
  /**
   *
   * Consumes the given configuration object and initializes dependencies.
   * @constructor
   * @param {Object} config - The configuration `Object`.
   * @returns {undefined}
   */
  constructor() {
    _defineProperty(this, "_cache", (key, data) => {
      this.__cache[key] = data;
    });

    _defineProperty(this, "_cacheDocument", (hash, collection, document) => {
      let formattedResult;

      if (document) {
        formattedResult = {
          database: this.config.db.name,
          dataSet: collection,
          data: document
        };

        this._cache(hash, formattedResult);
      }

      return Promise.resolve(formattedResult);
    });

    _defineProperty(this, "idsInDoc", (document, carry) => {
      const isArray = ld.lang.isArray(document);
      const isObject = ld.lang.isPlainObject(document);
      const ids = carry || [];
      if (ld.lang.isEmpty(document)) return ids;

      if (ObjectId.isValid(document.toString())) {
        ids.push(document.toString());
      } else if (isArray) {
        document.forEach(doc => ids.concat(this.idsInDoc(doc, ids)));
      } else if (isObject) {
        Object.keys(document).forEach(key => {
          const result = ids.concat(this.idsInDoc(document[key], ids));
          return result;
        });
      }

      return ids;
    });

    _defineProperty(this, "idsToQuery", ids => {
      const result = ids.map(_id => {
        const query = {
          _id: ObjectId(_id)
        };
        return query;
      });
      return result;
    });

    this.__cache = this.__cache || {};
  }
  /**
   *
   * Keeps `data` in memory under the provided `key`.
   * @todo - return the cached entry
   * @param {String|Symbol} key - The key under the data will be cached.
   * @param {any} data - The data to be kept.
   */


}

module.exports = Util;
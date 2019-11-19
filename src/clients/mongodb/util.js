const mongo = require('mongodb');
const ldLang = require('lodash/lang');

const ld = {
  lang: ldLang,
};

const { ObjectId } = mongo;

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
    this.__cache = this.__cache || {};
  }

  /**
   *
   * Keeps `data` in memory under the provided `key`.
   * @todo - return the cached entry
   * @param {String|Symbol} key - The key under the data will be cached.
   * @param {any} data - The data to be kept.
   */
  _cache = (key, data) => {
    this.__cache[key] = data;
  }

  /**
   *
   * Formats the given `document` to cache under the provided `hash`,
   * `collection` is kept for reference.
   * @todo - return the cached entry
   * @param {String|Symbol} hash - The key under the data will be cached.
   * @param {String} collection - The name of the collection the data is from.
   * @param {any} document - The data to be kept.
   * @returns {Object} - The formatted object to be cached.
   */
  _cacheDocument = (hash, collection, document) => {
    let formattedResult;
    if (document) {
      formattedResult = {
        database: this.config.db.name,
        dataSet: collection,
        data: document,
      };
      this._cache(hash, formattedResult);
    }

    return Promise.resolve(formattedResult);
  }

  /**
    * Recursively finds id-looking values
    * @return {array} valid ObjectIds converted to string:
    *   ["12345678901234567890"]
  */
  idsInDoc = (document, carry) => {
    const isArray = ld.lang.isArray(document);
    const isObject = ld.lang.isPlainObject(document);
    const ids = carry || [];

    if (ld.lang.isEmpty(document)) return ids;

    if (ObjectId.isValid(document.toString())) {
      ids.push(document.toString());
    } else if (isArray) {
      document.forEach((doc) => ids.concat(this.idsInDoc(doc, ids)));
    } else if (isObject) {
      Object.keys(document).forEach((key) => {
        const result = ids.concat(this.idsInDoc(document[key], ids));
        return result;
      });
    }

    return ids;
  }

  /**
   * Given a list of stringified ObjectIds, creates query objects for those specific ids,
   * converted into ObjectId.
   * @param {Array.<String>} ids - List of stringified ObjectIds
   * @returns {{Array.<Object>}} - The list of query objects.
   */
  idsToQuery = (ids) => {
    const result = ids.map((_id) => {
      const query = { _id: ObjectId(_id) };
      return query;
    });
    return result;
  }
}

module.exports = Util;

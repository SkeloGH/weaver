const mongo   = require('mongodb');

const ObjectId    = mongo.ObjectID;


class Util {
  constructor(config) {
    this.__cache  = this.__cache || {};
  }

  _cache = (key, data) => {
    this.__cache[key] = data;
  }

  _cacheDocument = (hash, collection, document) => {
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
  }

  /**
    * Recursively finds id-looking values
    * @return {array} valid ObjectIds converted to string:
    *   ["12345678901234567890"]
  */
  idsInDoc = (document, carry) => {
    const validDoc = typeof document !== 'undefined' && document !== null;
    const isArray  = Array.isArray(document);
    const isObject = !isArray && typeof document === 'object';
    const ids      = carry || [];

    if (!validDoc) return ids;

    if ((typeof document === 'string' && ObjectId.isValid(document)) || ObjectId.isValid(document.toString())) {
      ids.push(document.toString());
    } else if (isArray) {
      document.forEach(doc => ids.concat(this.idsInDoc(doc, ids)));
    } else if (isObject) {
      Object.keys(document).map(key => {
        return ids.concat(this.idsInDoc(document[key], ids));
      });
    }

    return ids;
  }

  idsToQuery = (ids) => {
    return ids.map(_id => {
      return { _id: ObjectId(_id)}
    });
  }
}

module.exports = Util;

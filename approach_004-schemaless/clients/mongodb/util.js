const mongo   = require('mongodb');
const ld      = {
  lang: require('lodash/lang')
};

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
    const isArray  = ld.lang.isArray(document);
    const isObject = ld.lang.isPlainObject(document);
    const ids      = carry || [];

    if (ld.lang.isEmpty(document)) return ids;

    if (ObjectId.isValid(document.toString())) {
      ids.push(document.toString());
    } else if (isArray) {
      document.forEach(doc => ids.concat(this.idsInDoc(doc, ids)));
    } else if (isObject) {
      Object.keys(document).forEach(key => {
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

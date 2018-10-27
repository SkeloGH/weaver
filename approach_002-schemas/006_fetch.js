const async = require('async');
const mongo = require('mongodb');


const QUERIES = require('./queries.out');
const REQUIRED_ARGS = ['collection','id']
const SCHEMA_NAMES = Object.keys(QUERIES);

let db;
const ObjectId = mongo.ObjectID;


class Weaver {
  constructor(cfg, cb) {
    const config = cfg || this.parseArgs();
    this.output = {};
    this.collectionMappings = config.collectionMappings;

    if (!this.validConfig(config)) return cb(null);
    db = db || config.db;
  }

  parseArgs() {
    const config = {};
    process.argv.forEach(arg => {
      const paramValuePair = arg.split('=');
      const name = paramValuePair[0];
      const value = paramValuePair[1];
      config[name] = value;
    });
    return config;
  }

  validConfig(config) {
    const configs = Object.keys(config).filter(cfg => {
      return REQUIRED_ARGS.includes(cfg);
    });
    return configs.length >= REQUIRED_ARGS.length;
  }

  schemaName(name) {
    const collectionName = SCHEMA_NAMES.find(schema => {
      const target = this.mappedCollectionName('name', name.toLowerCase());
      const source = this.mappedCollectionName('name', schema.toLowerCase());
      return target == source;
    });
    return collectionName
  }

  mappedCollectionName(type, collectionName) {
    return (
      this.collectionMappings
      && this.collectionMappings[type]
      && this.collectionMappings[type][collectionName])
    || collectionName;
  }

  queriesOf(collection) {
    const schema = this.schemaName(collection);
    const collectionQueries = QUERIES[schema];
    return { schema, collectionQueries };
  }

  findReferences(document, queries, collection, cb) {
    async.each(queries, (query, eCb) => {
      const fields = query.split('.');
      const prevDoc = Object.assign({}, document);
      let fieldSliceOrigin = -1;

      async.each(fields, (field, eeCb) => {
        fieldSliceOrigin++
        const collectionSource = prevDoc[field];
        const _id = collectionSource;
        const nextFields = fields.slice(fieldSliceOrigin);

        let collectionName, _queries;
        let fieldIsArray = field == '0' && collectionSource;
        fieldIsArray = fieldIsArray || ObjectId.isValid(_id ? _id[0]: _id);

        if (!fieldIsArray && ObjectId.isValid(_id ? _id.toString() : _id) && field != '_id') {
          collectionName = this.mappedCollectionName('field', field.replace(/id/i,'').toLowerCase());
          this.interlace(collectionName, _id, eeCb);
        }else if (fieldIsArray) {
          async.each(Object.keys(prevDoc), (keyIndex, kCb) => {//supports both numeric keys or arrays
            const nestedDoc = prevDoc[keyIndex];
            const nestedDocKeys = Object.keys(nestedDoc);
            const nextQueries = nextFields.slice(fieldSliceOrigin).join('.');
            _queries = nestedDocKeys.concat(nextQueries);

            if (typeof nestedDoc == 'string'){// && ObjectId.isValid(nestedDoc)
              if (ObjectId.isValid(nestedDoc)){
                collectionName = queries[queries.length - 1].replace(/id/i,'').toLowerCase();
                collectionName = this.mappedCollectionName('field', collectionName)
                return this.interlace(collectionName, nestedDoc, kCb);
              }
              return kCb()
            }
            this.findReferences(nestedDoc, _queries, collection, kCb);
          }, eeCb);
        }else if(typeof collectionSource == 'object') {
          _queries = [nextFields.join('.')]
          this.findReferences(collectionSource, _queries, collection, eeCb)
        }else{
          eeCb();
        }
      }, eCb);
    }, cb);
  }

  interlace(coll, _id, cb) {
    async.waterfall([
      (sCb) => {
        const query = { '_id' : ObjectId(_id) };
        const collection = this.mappedCollectionName('name', coll);
        const cachedResult = this.fromCache(collection, _id ? _id.toString() : _id);
        if (cachedResult) return sCb(null, collection, [cachedResult]);

        db.collection(collection).find(query).toArray((err, res) => {
          sCb(err, collection, res);
        });
      },

      (collection, results, sCb) => {
        const { collectionQueries } = this.queriesOf(collection);
        async.each(results, (result, eCb) => {
          const shouldCache = !this.isCached(collection, result);
          if (!shouldCache) return eCb();
          this.memoize(collection, result);
          this.findReferences(result, collectionQueries, collection, eCb);
        }, sCb);
      }
    ], (err) => {
      cb(err, this.output);
    });
  }

  fromCache(collection, _id) {
    return this.output && this.output[collection] && this.output[collection][_id];
  }

  memoize(collection, result) {
    if(!this.output[collection]){
      this.output[collection] = {};
    }
    this.output[collection][result._id] = result;
  }

  isCached(collection, result) {
    return !!this.fromCache(collection, result ? result._id : result);
  }
}

module.exports = Weaver;
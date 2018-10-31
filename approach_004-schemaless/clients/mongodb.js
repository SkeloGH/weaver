const mongo   = require('mongodb');
const tunnel  = require('tunnel-ssh');
const logging = require('debug');
const md5     = require('md5');

const MongoClient = mongo.MongoClient;
const ObjectId    = mongo.ObjectID;


/**
  @class WeaverMongoClient
  @arguments config<Object>:
    {
      type: 'source' || 'target',
      db: {
        url: <String> db address, ex: 'mongodb://localhost:27017'
        name: <String>db name ex: 'my-app-store',
        options: {
          [http://mongodb.github.io/node-mongodb-native/3.1/reference/connecting/connection-settings/]
        }
      },
      sshTunelConfig : {
        [https://www.npmjs.com/package/tunnel-ssh#config-example]
        [https://github.com/mscdex/ssh2#client-methods]
      }
    }
*/
class WeaverMongoClient {
  constructor(config) {
    this.logging     = logging(`WeaverMongoClient:${config.db.name}`);
    this.type        = config.type;
    this.config      = config;
    this.db          = null;
    this.remote      = null;
    this.results     = [];
    this.collections = [];
    this.collNames   = [];
    this.__cache     = {};

    // Hide mongo deprecation notice by using the new url parser
    this.config.db.options['useNewUrlParser'] = true;

    // Bind functions called in nested scopes
    this.query             = this.query.bind(this);
    this._fetchCollections = this._fetchCollections.bind(this);
    this._fetchDocuments   = this._fetchDocuments.bind(this);
    this._cache            = this._cache.bind(this);
    this.idsInDoc          = this.idsInDoc.bind(this);
    this.interlace         = this.interlace.bind(this);
  }

  connect() {
    this.logging('Connecting MongoDb client');
    return new Promise((resolve, reject) => {
      const host    = this.config.db.url;
      const options = this.config.db.options;

      if (!this.config.sshTunnelConfig) {
        MongoClient.connect(host, options, (error, database) => {
          if (error) reject(this.onError(error, 'failed to connect'));
          this.db = database.db(this.config.db.name);
          this.logging('Connection success');
          this._fetchCollections().then((collectionNames) => {
            this.logging(collectionNames.length + ' collections in db');
            resolve();
          });
        });
      }

      // this.remote = tunnel(this.config.sshTunnelConfig)
      //   .then((error, server) => {
      //     if (error){
      //       this.onError(error);
      //       return reject(error);
      //     }
      //     this._fetchCollections(resolve);
      //   });
    });
  }

  _fetchCollections() {
    this.logging('Listing collections');
    return new Promise((resolve, reject) => {
      this.db
      .listCollections({} , { nameOnly:true }).toArray()
      .then((collections) => {
        this.collections = collections;
        this.collNames = collections.map(result => result.name);
        resolve(this.collNames);
      });
    });
  }

  query(query) {
    return new Promise((resolve, reject) => {
      const dbScans = this.collNames.map(this._fetchDocuments.bind(this, query));
      Promise.all(dbScans)
      .catch(this.onError)
      .then(results => {
        const dataEntries = results.filter(result => !!result);
        this.logging('Fetch results:')
        this.logging('-- ', dataEntries)
        resolve(dataEntries);
      });
    });
  }

  _fetchDocuments(query, collection) {
    const queryHash = md5(JSON.stringify(query));

    if (this.__cache[queryHash]) return resolve([this.__cache[queryHash]]);

    return new Promise((resolve, reject) => {
      this.db.collection(collection).findOne(query)
      .then(document => {
        if (document) {
          this.logging(`${collection}.find(${query.toString()}): `);
          const formattedResult = {
            database: this.config.db.name,
            dataSet: collection,
            data: document
          };
          this._cache(queryHash, formattedResult);
          resolve(formattedResult);
        } else {
          resolve();
        }
      })
    });
  }

  _cache(key, data){
    this.results.push(data);
    this.__cache[key] = data;
  }

  interlace(documents, cb) {
    this.logging('interlacing')
    // let queries = [];
    const idsInDocs = this.idsInDoc(documents);

    // idsInDocs.forEach(_id => {
    //   if (_id && _id.length) {
    //     const promise = this.query({'_id': ObjectId(_id)});
    //     queries.push(promise);
    //   }
    // });
    // return queries;
  }

  idsInDoc(document, carry) {
    const isArray = Array.isArray(document);
    const isObject = !isArray && typeof document == 'object';
    const ids = carry || [];

    if (typeof document == 'string' || ObjectId.isValid(document.toString())) {
      ObjectId.isValid(document) && ids.push(document);
    } else if (isArray) {
      document.forEach(doc => ids.concat(this.idsInDoc(doc, ids)));
    } else if (isObject) {
      Object.keys(document).map(key => {
        return ids.concat(this.idsInDoc(document[key], ids));
      });
    }
    return ids;
  }

  get data() {
    return {
      db: this.config.db.name,
      results: this.__cache,
    };
  }

  onError(error, message) {
    if (message) console.error(message, error);
    return this.config.onError && this.config.onError(error);
  }


  disconnect(data, cb) {
    this.remote.close();
  }
}

module.exports = WeaverMongoClient
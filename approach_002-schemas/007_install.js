const fs       = require('fs');
const readline = require('readline');
const async    = require('async');
const mongo    = require('mongodb');

const CFG      = require('./config.out');
const Weaver   = require('./006_fetch');

const MongoClient = mongo.MongoClient;

const prompt = (message, cb) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(message, (answer) => {
    rl.close();
    return cb(null, answer);
  });
}

const connectSource = (cb) => {
  const host = CFG.dbHost.source;
  const options = CFG.dbOptions.source;
  MongoClient.connect(host, options, cb);
};

const interlace = (database, cb) => {
  const sourceDb = database.db(CFG.dbName.source);
  const config = {
    db: sourceDb,
    collection: CFG.collectionName,
    id: CFG.documentId,
    collectionMappings: CFG.collectionMappings,
  };
  const weaver = new Weaver(config);
  weaver.interlace(config.collection, config.id, (err, result) => {
    database.close();
    return cb(err, result);
  });
};

const warn = (result, cb) => {
  const collections = Object.keys(result);
  console.log('\n Target db is '+CFG.dbName.target);
  console.log('\n Found interlaced collections:\n\n'+collections.join('\n'));
  return cb(null, result);
};

const saveJSON = (result, cb) => {
  prompt('\nsave JSON? [y]es: ', (err, answer) => {
    if (answer != 'y') return cb(null, result);
    const fileName = CFG.collectionName + '_' + CFG.documentId + '.out.json';
    const filePath = './results/' + fileName;
    const fileContent = JSON.stringify(result, null, 2);

    fs.writeFile(filePath, fileContent, 'utf8', (err) => {
      console.info('\nsaved to: '+filePath+'\n');
      return cb(err, result);
    });
  });
};

const connectTarget = (result, cb) => {
  const host = CFG.dbHost.target;
  const options = CFG.dbOptions.target;
  MongoClient.connect(host, options, (err, database) => {
    return cb(err, result, database);
  });
};

const dangerouslyDropTargetDb = (result, database, cb) => {
  const targetDb = database.db(CFG.dbName.target);
  if (!CFG.dropTargetDb) return cb(null, result, database, targetDb);

  targetDb.dropDatabase((err, dropResult) => {
    if (err) console.info(dropResult);
    return cb(err, result, database, targetDb);
  });
}

const install = (result, database, targetDb, cb) => {
  const collections = Object.keys(result);
  let idx = 0;
  let installAll = false;
  let skipAll = false;

  async.eachLimit(collections, 1, (collection, eCb) => {
    const docsById = result[collection];
    const docs = Object.keys(docsById).map(docId => docsById[docId]);
    const inputOptions = ['[y]es','[n]o','[a]ll','[v]iew','[q]uit'].join(' ');
    const message = ['\n','add',docs.length,'docs to',collection,'-',inputOptions,': '].join(' ');
    idx++;

    if (installAll) return targetDb.collection(collection).insertMany(docs, eCb);
    if (skipAll) return eCb()

    prompt(message, (err, answer) => {
      installAll = answer == 'a';
      skipAll = answer == 'q';
      const shouldInstall = installAll || answer == 'y';
      const view = answer == 'v';

      if (shouldInstall) {
        return targetDb.collection(collection).insertMany(docs, eCb);
      } else if (view) {
        console.log('\n\n' + JSON.stringify(docs, null, 2));
      }
      return eCb();
    });
  }, err => {
    database.close()
    if (err) return cb(err, result[collections[idx]] );
    return cb();
  });
}

async.waterfall([
  connectSource,
  interlace,
  warn,
  saveJSON,
  connectTarget,

  dangerouslyDropTargetDb,

  install,
], (err, meta) => {
  if (err) throw err
  if (meta) console.log(meta);
  console.info('Done');
  return process.exit();
});

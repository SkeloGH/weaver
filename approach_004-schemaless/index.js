const fs       = require('fs');
const readline = require('readline');
const async    = require('async');

const config   = require('./config');

class Weaver {
  constructor(config) {
    this.dataClients = config.dataClients;
    this.dataSources = this.dataClients.filter(client => client.config.type === 'source');
    this.dataTargets = this.dataClients.filter(client => client.config.type === 'target');
    this.showResult = this.showResult.bind(this);
  }

  prompt(message, cb) {
    const rl = readline.createInterface({
      input: process.stdin, output: process.stdout,
    });

    rl.question(message, answer => {
      rl.close();
      return cb(null, answer);
    });
  }

  fetch() {
    const clientConnections = this.dataSources.map(client => {
      return client.connect()
        .catch(client.onError)
        // .then(client.fetch)
        // .finally(() => {
        //   client.out(fetchedData);
        //   client.disconnect();
        // });
    })
    return Promise.all(clientConnections);
  }

  showResult(result) {
    console.log('\n Target dbs are '+this.dataTargets.map(client => client.config.db.name));
    console.log(result)
    return new Promise((resolve, reject) => {
      try {
        const collections = Object.keys(result);
        console.log('\n Found interlaced collections:\n\n'+collections.join('\n'));
        resolve(result);
      } catch(e) {
        reject(e);
      }
    })
  }

  saveAsJSON(result, cb) {
    this.prompt('\nsave JSON? [y]es: ', (err, answer) => {
      if (answer != 'y') return cb(null, result);
      const fileName = CFG.collectionName + '_' + CFG.documentId + '.out.json';
      const filePath = './results/' + fileName;
      const fileContent = JSON.stringify(result, null, 2);

      fs.writeFile(filePath, fileContent, 'utf8', (err) => {
        console.info('\nsaved to: '+filePath+'\n');
        return cb(err, result);
      });
    });
  }

  run(cb) {
    this.fetch()
      .then(this.showResult)
      .catch(console.error)
      // .then(this.saveAsJSON)
      // .then(this.dump)
      // .finally(cb);
  }
}

// TODO: detect if running as module or expect query in script arguments
new Weaver(config).run((err) => {
  console.log('Done');
  process.exit()
});



// const interlace = (database, cb) => {
//   const sourceDb = database.db(CFG.dbName.source);
//   const config = {
//     db: sourceDb,
//     collection: CFG.collectionName,
//     id: CFG.documentId,
//     collectionMappings: CFG.collectionMappings,
//   };
//   const weaver = new Weaver(config);
//   weaver.interlace(config.collection, config.id, (err, result) => {
//     database.close();
//     return cb(err, result);
//   });
// };

// const connectTarget = (result, cb) => {
//   const host = CFG.dbHost.target;
//   const options = CFG.dbOptions.target;
//   MongoClient.connect(host, options, (err, database) => {
//     return cb(err, result, database);
//   });
// };


// const install = (result, database, targetDb, cb) => {
//   const collections = Object.keys(result);
//   let idx = 0;
//   let installAll = false;
//   let skipAll = false;

//   async.eachLimit(collections, 1, (collection, eCb) => {
//     const docsById = result[collection];
//     const docs = Object.keys(docsById).map(docId => docsById[docId]);
//     const inputOptions = ['[y]es','[n]o','[a]ll','[v]iew','[q]uit'].join(' ');
//     const message = ['\n','add',docs.length,'docs to',collection,'-',inputOptions,': '].join(' ');
//     idx++;

//     if (installAll) return targetDb.collection(collection).insertMany(docs, eCb);
//     if (skipAll) return eCb()

//     prompt(message, (err, answer) => {
//       installAll = answer == 'a';
//       skipAll = answer == 'q';
//       const shouldInstall = installAll || answer == 'y';
//       const view = answer == 'v';

//       if (shouldInstall) {
//         return targetDb.collection(collection).insertMany(docs, eCb);
//       } else if (view) {
//         console.log('\n\n' + JSON.stringify(docs, null, 2));
//       }
//       return eCb();
//     });
//   }, err => {
//     database.close()
//     if (err) return cb(err, result[collections[idx]] );
//     return cb();
//   });
// }

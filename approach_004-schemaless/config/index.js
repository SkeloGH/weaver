const mongo = require('mongodb');

const dataClients = require('./clients');

const ObjectId = mongo.ObjectID;

module.exports = {
  queries: [
    { _id: ObjectId("58dd856c1a70665027a41183") /* example id, don't panic */ },
  ],
  dataClients: dataClients,
  jsonConfig: {
    filePath: `${process.env.PWD}/results/weaver.out.json`
  }
}

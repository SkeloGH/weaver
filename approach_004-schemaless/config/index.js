const mongo = require('mongodb');

const dataClients = require('./clients');

const ObjectId = mongo.ObjectID;

module.exports = {
  queries: [
    { _id: ObjectId("5bde262fa09d0c95cbc62b38") /* example id, don't panic */ },
    { _id: ObjectId("5bde2691a09d0c95cbc62b4a") /* example id, don't panic */ },
  ],
  dataClients: dataClients,
  jsonConfig: {
    filePath: `${process.env.PWD}/results/weaver.out.json`
  }
}

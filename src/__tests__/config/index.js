const ObjectId = require('bson-objectid');
const { dataClients } = require('./clients/mongodb');

module.exports = {
  queries: [
    { _id: ObjectId('abcdef78901234abcdef1234') },
  ],
  dataClients,
  jsonConfig: {
    filePath: `${process.env.PWD}/results/weaver.test.json`,
  },
};

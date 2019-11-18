const mongo = require('mongodb');

const dataClients = require('./clients');

const ObjectId = mongo.ObjectID;

/**
 * The main app configuration.
 */
module.exports = {
  /**
   * Edit `queries` field to retrieve the base set of documents to pull related documents from.
   * @todo - Redesign config to be explicit on the type of client the query should run onto,
   * at least between DB drivers, alternatively
   * allow defining the clients to run the query onto.
   */
  queries: [
    { _id: ObjectId('5bde262fa09d0c95cbc62b38') /* example id, don't panic */ },
    { _id: ObjectId('5bde2691a09d0c95cbc62b4a') /* example id, don't panic */ },
  ],
  /**
   * These are the clients you've configured under `config/clients.js`.
   */
  dataClients,
  jsonConfig: {
    /**
     * Defines where the JSON output should be saved to.
     */
    filePath: `${process.env.PWD}/results/weaver.out.json`,
  },
};

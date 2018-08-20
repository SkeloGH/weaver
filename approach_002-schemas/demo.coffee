CFG = require './config.out'
async = require 'async'
mongo = require 'mongodb'
Weaver = require './006_fetch'
MongoClient = mongo.MongoClient


# Demo
MongoClient.connect CFG.dbHost, (err, database) ->
  db = database.db(CFG.dbName)
  config = {
    'db': db
    'collection': CFG.collectionName
    'id': CFG.documentId
  }
  new Weaver config, (err, result) ->
    throw err if err
    console.log result
    console.log 'Done'
    database.close()
    process.exit()
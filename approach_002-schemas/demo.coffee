async = require 'async'
fs = require 'fs'
mongo = require 'mongodb'
CFG = require './config.out'
Weaver = require './006_fetch'
MongoClient = mongo.MongoClient


# Demo
db = null;
config = {};
database = null;

async.waterfall [
  (wCb) ->
    MongoClient.connect CFG.dbHost, wCb
  (_database, wCb) ->
    database = _database
    db = database.db(CFG.dbName)
    config.db = db
    config.collection = CFG.collectionName
    config.id = CFG.documentId
    weaver = new Weaver(config)
    weaver.interlace config.collection, config.id, wCb
], (err, result) ->
  throw err if err
  fileName = './results/' + CFG.collectionName + '_' + CFG.documentId + '.out.json'
  fs.writeFileSync fileName, JSON.stringify(result, null, 2), 'utf-8'
  console.info fileName
  database.close() && process.exit();

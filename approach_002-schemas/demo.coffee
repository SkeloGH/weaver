fs = require 'fs'
readline = require('readline');

async = require 'async'
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
    config.collectionMappings = CFG.collectionMappings
    weaver = new Weaver(config)
    weaver.interlace config.collection, config.id, wCb
  (result, wCb) ->
    fileName = './results/' + CFG.collectionName + '_' + CFG.documentId + '.out.json'
    fileContent = JSON.stringify(result, null, 2)
    console.info fileName
    fs.writeFileSync fileName, fileContent, 'utf8'
    wCb(null, result)
  (result, wCb) ->
    collections = Object.keys result
    async.eachLimit collections, 1, (collection, eCb) ->
      docsById = result[collection]
      rl = readline.createInterface
        input: process.stdin,
        output: process.stdout

      docs = Object.keys(docsById).map (docId) ->
        return docsById[docId]

      message ='add ' + docs.length + ' docs to ' + collection + '? [y/n]: '
      rl.question message, (answer) ->

        if answer && answer == 'y'
          db.collection(collection).insertMany(docs, eCb)
          rl.close()
          return
        rl.close()
        eCb()
    , wCb
], (err) ->
  throw err if err

  database.close() && process.exit();

fs = require 'fs'
readline = require('readline');

async = require 'async'
mongo = require 'mongodb'

CFG = require './config.out'
Weaver = require './006_fetch'

MongoClient = mongo.MongoClient


# Demo
sourceDb = null;
config = {};

async.waterfall [
  (wCb) ->
    MongoClient.connect CFG.dbHost.source, CFG.dbOptions.source, wCb
  (database, wCb) ->
    sourceDb = database.db(CFG.dbName.source)
    config.db = sourceDb
    config.collection = CFG.collectionName
    config.id = CFG.documentId
    config.collectionMappings = CFG.collectionMappings
    weaver = new Weaver(config)
    weaver.interlace config.collection, config.id, (err, result) ->
      database.close()
      wCb err, result
  (result, wCb) ->
    fileName = './results/' + CFG.collectionName + '_' + CFG.documentId + '.out.json'
    fileContent = JSON.stringify(result, null, 2)
    console.info fileName
    fs.writeFile fileName, fileContent, 'utf8', (err) ->
      wCb err, result
  (result, wCb) ->
    MongoClient.connect CFG.dbHost.target, CFG.dbOptions.target, (err, database) ->
      idx = 0
      targetDb = database.db(CFG.dbName.target)
      collections = Object.keys result
      console.log collections
      async.eachLimit collections, 1, (collection, eCb) ->
        docsById = result[collection]
        rl = readline.createInterface
          input: process.stdin,
          output: process.stdout

        docs = Object.keys(docsById).map (docId) ->
          return docsById[docId]

        message = 'add ' + docs.length + ' docs to ' + CFG.dbName.target+'\'s '+collection + '? [y/n]: '

        rl.question message, (answer) ->
          rl.close()
          switch answer
            when answer == 'y' then targetDb.collection(collection).insertMany(docs, eCb)
            else eCb()
        idx++
      , (err) ->
        database.close()
        wCb(err, result[collections[idx]])
], (err, meta) ->
  throw err if err
  console.log meta if meta
  process.exit();

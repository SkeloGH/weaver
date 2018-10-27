fs = require 'fs'
readline = require('readline');

async = require 'async'
mongo = require 'mongodb'

CFG = require './LEGACY_config.out'
Weaver = require './LEGACY_006_fetch'

MongoClient = mongo.MongoClient

prompt = (message, cb) ->
  rl = readline.createInterface
    input: process.stdin,
    output: process.stdout
  rl.question message, (answer) ->
    rl.close()
    cb(null, answer)

async.waterfall [
  connectSource = (wCb) ->
    MongoClient.connect CFG.dbHost.source, CFG.dbOptions.source, wCb

  interlace = (database, wCb) ->
    sourceDb = database.db(CFG.dbName.source)
    config = {
      db: sourceDb
      collection: CFG.collectionName
      id: CFG.documentId
      collectionMappings: CFG.collectionMappings
    }
    weaver = new Weaver(config)
    weaver.interlace config.collection, config.id, (err, result) ->
      database.close()
      wCb err, result

  warn = (result, wCb) ->
    collections = Object.keys result
    console.log '\n Target db is '+CFG.dbName.target
    console.log '\n Found interlaced collections:\n\n'+collections.join('\n')
    wCb null, result

  saveJSON = (result, wCb) ->
    prompt '\nsave JSON? [y]es: ', (err, answer) ->
      return wCb null, result unless answer == 'y'
      fileName = CFG.collectionName + '_' + CFG.documentId + '.out.json'
      filePath = './results/' + fileName
      fileContent = JSON.stringify(result, null, 2)

      fs.writeFile filePath, fileContent, 'utf8', (err) ->
        console.info '\nsaved to: '+filePath+'\n'
        wCb err, result

  connectTarget = (result, wCb) ->
    MongoClient.connect CFG.dbHost.target, CFG.dbOptions.target, (err, database) ->
      wCb err, result, database

  setupTarget = (result, database, wCb) ->
    targetDb = database.db(CFG.dbName.target)
    return wCb(null, result, database, targetDb) unless CFG.dropTargetDb

    targetDb.dropDatabase (err, dropResult) ->
      console.info dropResult if err
      wCb(err, result, database, targetDb)

  install = (result, database, targetDb, wCb) ->
    idx = 0
    collections = Object.keys result
    installAll = false
    skipAll = false
    async.eachLimit collections, 1, (collection, eCb) ->
      docsById = result[collection]
      docs = Object.keys(docsById).map (docId) -> docsById[docId]
      inputOptions = ['[y]es','[n]o','[a]ll','[v]iew','[q]uit'].join(' ')
      message = ['\n','add',docs.length,'docs to',collection,'-',inputOptions,': '].join(' ')
      idx++

      return targetDb.collection(collection).insertMany(docs, eCb) if installAll
      return eCb() if skipAll

      prompt message, (err, answer) ->
        installAll = answer == 'a'
        shouldInstall = installAll || answer == 'y'
        skipAll = answer == 'q'
        view = answer == 'v'

        if shouldInstall
          return targetDb.collection(collection).insertMany(docs, eCb)
        else if view
          console.log '\n\n' + JSON.stringify(docs, null, 2)
        eCb()
    , (err) ->
      database.close()
      wCb(err, result[collections[idx]] if err)
], (err, meta) ->
  throw err if err
  console.log meta if meta
  console.info 'Done'
  process.exit();

fs = require 'fs'
async = require 'async'
mongo = require 'mongodb'
MongoClient = mongo.MongoClient
ObjectId = mongo.ObjectID

QUERIES = require './queries.out'
DB_HOST = 'mongodb://localhost:27017'
DB_NAME = 'sl-dev'
REQUIRED_ARGS = ['collection','id']
db = null

class Weaver
  constructor: (cb) ->
    config = @parseArgs()
    @output = {}
    return cb null unless @validConfig(config)
    @lookup(config.collection, config.id, cb)
    return @

  parseArgs: () =>
    config = {}
    process.argv.forEach (arg) =>
      paramValuePair = arg.split '='
      name = paramValuePair[0]
      value = paramValuePair[1]
      config[name] = value
    return config

  validConfig: (config) =>
    configs = Object.keys(config).filter (cfg) =>
      return REQUIRED_ARGS.includes cfg
    return configs.length >= REQUIRED_ARGS.length

  queriesOf: (collection) =>
    collections = Object.keys QUERIES
    collectionName = collections.find (_collection) =>
      _collection.toLowerCase() == collection.toLowerCase()
    collectionQueries = QUERIES[collectionName]
    return { collectionName, collectionQueries }

  findReferences: (document, queries, collection, cb) =>
    async.each queries, (query, eCb) =>
      fields = query.split('.')
      prevDoc = Object.assign {}, document
      fIdx = -1
      async.each fields, (field, eeCb) =>
        fIdx++
        if ObjectId.isValid prevDoc[field]
          @lookup(field.replace(/id/i,''), prevDoc[field], eeCb)
        else if typeof prevDoc[field] == 'object'
          @findReferences(prevDoc[field], fields.slice(fIdx), collection, eeCb)
        else
          eeCb()
      , eCb
    , cb


  itemSaved: (collection, result) =>
    return @output[collection]?[result?._id]?

  lookup: (collection, _id, cb) =>
    collectionName = collectionQueries = null
    async.waterfall [
      (sCb) =>
        { collectionName, collectionQueries } = @queriesOf collection
        sCb()
      (sCb) =>
        query = { '_id' : ObjectId(_id) }
        collection = @toPlural(collection)
        db.collection(collection).find(query).toArray (err, res) =>
          return sCb err if err
          results = res
          sCb null, results
      (results, sCb) =>
        counter = 0
        async.each results, (result, eCb) =>
          if !@itemSaved collection, result
            @saveResult collection, result
            @findReferences result, collectionQueries, collection, eCb
          else
            eCb()
        , sCb
    ], (err) =>
      cb err if err
      cb null, @output

  toPlural: (word) ->
    if (word.lastIndexOf('s')+1 < word.length)
      return word+'s'
    return word

  saveResult: (collection, result) =>
    if !@output[collection]
      @output[collection] = {}
    @output[collection][result._id] = result

MongoClient.connect DB_HOST, (err, database) ->
  db = database.db(DB_NAME)
  new Weaver (err, result) ->
    throw err if err
    console.log result
    console.log 'Done'
    database.close()
    process.exit()
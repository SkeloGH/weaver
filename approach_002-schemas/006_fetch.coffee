async = require 'async'
mongo = require 'mongodb'
ObjectId = mongo.ObjectID

QUERIES = require './queries.out'
REQUIRED_ARGS = ['collection','id']
COLLECTIONS = Object.keys QUERIES

db = db ||= null

class Weaver
  constructor: (cfg, cb) ->
    config = cfg ||= @parseArgs()
    @output = {}
    @collectionMappings = config.collectionMappings
    return cb null unless @validConfig(config)
    db = db ||= config.db

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

  collectionName: (collection) =>
    collectionName = COLLECTIONS.find (_collection) =>
      target = @mappedCollectionName(collection.toLowerCase())
      source = @mappedCollectionName(_collection.toLowerCase())
      return target == source
    return collectionName

  mappedCollectionName: (collectionName) ->
    return @collectionMappings[collectionName] || collectionName

  queriesOf: (collection) =>
    collectionName = @collectionName(collection)
    collectionQueries = QUERIES[collectionName]
    return { collectionName, collectionQueries }

  findReferences: (document, queries, collection, cb) =>
    async.each queries, (query, eCb) =>
      fields = query.split('.')
      prevDoc = Object.assign {}, document
      fIdx = -1

      async.each fields, (field, eeCb) =>
        fIdx++
        _id = collectionSource = prevDoc[field]
        fieldIsArray = field == '0'
        nextFields = fields.slice(fIdx)

        if ObjectId.isValid _id
          collectionName = field.replace(/id/i,'')
          @interlace(collectionName, _id, eeCb)
        else if fieldIsArray && prevDoc[field]
          async.each Object.keys(prevDoc), (index, kCb) => #supports both numeric keys or arrays
            nestedDoc = prevDoc[index]
            @findReferences(nestedDoc, Object.keys(nestedDoc), collection, kCb) # greedy lookup
          , eeCb
        else if typeof collectionSource == 'object'
          @findReferences(collectionSource, nextFields.join('.'), collection, eeCb)
        else
          eeCb()
      , eCb
    , cb

  interlace: (collection, _id, cb) =>
    async.waterfall [
      (sCb) =>
        query = { '_id' : ObjectId(_id) }
        collection = @mappedCollectionName(collection)
        db.collection(collection).find(query).toArray sCb
      (results, sCb) =>
        { collectionQueries } = @queriesOf collection
        async.each results, (result, eCb) =>
          shouldCache = !@isCached collection, result
          return eCb() unless shouldCache
          if shouldCache
            @cacheResult collection, result
            @findReferences result, collectionQueries, collection, eCb
        , sCb
    ], (err) =>
      cb err if err
      cb null, @output

  cacheResult: (collection, result) =>
    if !@output[collection]
      @output[collection] = {}
    @output[collection][result._id] = result

  isCached: (collection, result) =>
    return @output[collection]?[result?._id]?

module.exports = Weaver
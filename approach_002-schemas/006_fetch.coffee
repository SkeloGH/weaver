async = require 'async'
mongo = require 'mongodb'
ObjectId = mongo.ObjectID

QUERIES = require './queries.out'
REQUIRED_ARGS = ['collection','id']

db = db ||= null

class Weaver
  constructor: (cfg, cb) ->
    config = cfg ||= @parseArgs()
    @output = {}
    return cb null unless @validConfig(config)
    db = db ||= config.db
    @lookup(config.collection, config.id, cb)

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
      @mutateCollectionName(_collection.toLowerCase()) == @mutateCollectionName(collection.toLowerCase())
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

  lookup: (collection, _id, cb) =>
    async.waterfall [
      (sCb) =>
        query = { '_id' : ObjectId(_id) }
        collection = @mutateCollectionName(collection)
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

  mutateCollectionName: (collectionName) ->
    # TODO: this should be a configurable transformation fxn
    #  to add flexibility and supporting to differenct collection name patterns
    if (collectionName.lastIndexOf('s') + 1 < collectionName.length)
      return collectionName+'s'
    return collectionName

  cacheResult: (collection, result) =>
    if !@output[collection]
      @output[collection] = {}
    @output[collection][result._id] = result

  isCached: (collection, result) =>
    return @output[collection]?[result?._id]?

module.exports = Weaver
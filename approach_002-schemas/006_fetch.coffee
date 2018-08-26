async = require 'async'
mongo = require 'mongodb'
ObjectId = mongo.ObjectID

QUERIES = require './queries.out'
REQUIRED_ARGS = ['collection','id']
SCHEMA_NAMES = Object.keys QUERIES

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

  schemaName: (name) =>
    collectionName = SCHEMA_NAMES.find (schema) =>
      target = @mappedCollectionName('name', name.toLowerCase())
      source = @mappedCollectionName('name', schema.toLowerCase())
      return target == source
    return collectionName

  mappedCollectionName: (type, collectionName) ->
    return @collectionMappings?[type]?[collectionName] || collectionName

  queriesOf: (collection) =>
    schema = @schemaName(collection)
    collectionQueries = QUERIES[schema]
    return { schema, collectionQueries }

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

        if ObjectId.isValid(_id?.toString()) && field != '_id'
          collectionName = @mappedCollectionName('field', field.replace(/id/i,'').toLowerCase())
          @interlace(collectionName, _id, eeCb)
        else if fieldIsArray && prevDoc[field]
          # TODO: support ids in array format (e.g.: artworkIds: ['...','...'])
          async.each Object.keys(prevDoc), (index, kCb) => #supports both numeric keys or arrays
            nestedDoc = prevDoc[index]
            _queries = Object.keys(nestedDoc).concat(nextFields.slice(fIdx).join('.'))
            @findReferences(nestedDoc, _queries, collection, kCb) # greedy lookup
          , eeCb
        else if typeof collectionSource == 'object'
          @findReferences(collectionSource, [nextFields.join('.')], collection, eeCb)
        else
          eeCb()
      , eCb
    , cb

  interlace: (coll, _id, cb) =>
    async.waterfall [
      (sCb) =>
        query = { '_id' : ObjectId(_id) }
        collection = @mappedCollectionName('name', coll)
        cachedResult = @fromCache(collection, _id?.toString())
        if cachedResult
          sCb(null, collection, _id, [cachedResult])
        else
          db.collection(collection).find(query).toArray (err, res) ->
            sCb err, collection, _id, res
      (collection, _id, results, sCb) =>
        { collectionQueries } = @queriesOf collection
        async.each results, (result, eCb) =>
          shouldCache = !@isCached collection, result
          return eCb() unless shouldCache
          if shouldCache
            @cacheResult collection, result
            @findReferences result, collectionQueries, collection, eCb
        , sCb
    ], (err) =>
      cb err, @output

  fromCache: (collection, _id) =>
    return @output[collection]?[_id]

  cacheResult: (collection, result) =>
    if !@output[collection]
      @output[collection] = {}
    @output[collection][result._id] = result

  isCached: (collection, result) =>
    return !!@fromCache(collection, result?._id)

module.exports = Weaver
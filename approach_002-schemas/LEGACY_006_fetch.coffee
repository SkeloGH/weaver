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
      fieldSliceOrigin = -1

      async.each fields, (field, eeCb) =>
        fieldSliceOrigin++
        _id = collectionSource = prevDoc[field]
        fieldIsArray = field == '0' && collectionSource
        fieldIsArray = fieldIsArray || ObjectId.isValid(_id?[0])
        nextFields = fields.slice(fieldSliceOrigin)

        if !fieldIsArray && ObjectId.isValid(_id?.toString()) && field != '_id'
          collectionName = @mappedCollectionName('field', field.replace(/id/i,'').toLowerCase())
          @interlace(collectionName, _id, eeCb)
        else if fieldIsArray
          async.each Object.keys(prevDoc), (keyIndex, kCb) => #supports both numeric keys or arrays
            nestedDoc = prevDoc[keyIndex]
            nestedDocKeys = Object.keys(nestedDoc)
            nextQueries = nextFields.slice(fieldSliceOrigin).join('.')
            _queries = nestedDocKeys.concat(nextQueries)

            if typeof nestedDoc == 'string'# && ObjectId.isValid(nestedDoc)
              if ObjectId.isValid(nestedDoc)
                collectionName = queries[queries.length - 1].replace(/id/i,'').toLowerCase()
                collectionName = @mappedCollectionName('field', collectionName)
                return @interlace(collectionName, nestedDoc, kCb)
              return kCb()
            @findReferences(nestedDoc, _queries, collection, kCb)
          , eeCb
        else if typeof collectionSource == 'object'
          _queries = [nextFields.join('.')]
          @findReferences(collectionSource, _queries, collection, eeCb)
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
        return sCb(null, collection, [cachedResult]) if cachedResult

        db.collection(collection).find(query).toArray (err, res) ->
          sCb err, collection, res
      (collection, results, sCb) =>
        { collectionQueries } = @queriesOf collection
        async.each results, (result, eCb) =>
          shouldCache = !@isCached collection, result
          return eCb() unless shouldCache
          @memoize collection, result
          @findReferences result, collectionQueries, collection, eCb
        , sCb
    ], (err) =>
      cb err, @output

  fromCache: (collection, _id) =>
    return @output[collection]?[_id]

  memoize: (collection, result) =>
    if !@output[collection]
      @output[collection] = {}
    @output[collection][result._id] = result

  isCached: (collection, result) =>
    return !!@fromCache(collection, result?._id)

module.exports = Weaver
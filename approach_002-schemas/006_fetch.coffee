fs = require 'fs'
async = require 'async'
QUERIES = require './queries.out'
REQUIRED_ARGS = ['collection','id']

# mock logic start
ObjectId = (e) -> e
db = {
  analytics: {
    find: (e) ->
      return {
        exec: (cb) ->
          return cb( null, [ { _id: '4321', scope: { campaignId: '1234' } } ] )
      }
  },
  campaign: {
    find: (e) ->
      return {
        exec: (cb) ->
          return cb( null, [ { _id: '5678', groupId: '9123' } ] )
      }
  },
  group: {
    find: (e) ->
      return {
        exec: (cb) ->
          return cb( null, [
              {
                _id: '9123',
                shipping: {
                  prices: [ { productId:'9876' } ]
                }
              }
            ]
          )
      }
  }
  product: {
    find: (e) ->
      return {
        exec: (cb) ->
          return cb( null, [
              {
                _id: '9876',
                groupId: '9123'
              }
            ]
          )
      }
  }
}
# mock logic end

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

  findReferences: (document, queries) =>
    queries.forEach (query) =>
      fields = query.split('.')
      prevDoc = Object.assign {}, document
      referenceId = null

      fields.forEach (field, idx) =>
        if typeof prevDoc[field] == 'object'
          prevDoc = Object.assign {}, prevDoc[field]
        else
          referenceId = prevDoc[field]
          if referenceId
            @lookup field.replace(/id/i,''), referenceId, (err) =>
              throw err if err
  itemSaved: (collection, result) =>
    return @output[collection]?[result?._id]?

  lookup: (collection, _id, cb) =>
    collectionName = collectionQueries = null
    async.series [
      (sCb) =>
        { collectionName, collectionQueries } = @queriesOf collection
        sCb()
      (sCb) =>
        query = ObjectId(_id)
        db[collection]?.find(query).exec (err, results) =>
          results.forEach (result) =>
            if !@itemSaved collection, result
              @saveResult collection, result
              @findReferences result, collectionQueries
          sCb()
    ], (err) =>
      cb err, @output

  saveResult: (collection, result) =>
    if !@output[collection]
      @output[collection] = {}
    @output[collection][result._id] = result




new Weaver (err, result) ->
  throw err if err
  console.log result
  console.log 'Done'
  process.exit()

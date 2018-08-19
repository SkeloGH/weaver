fs = require 'fs'
async = require 'async'
SCHEMAS = require './imports.out'

main = (cb) ->
  graphNodes = null
  graphNodes = null
  rawQueries = null
  collectionQueries = {}

  async.series [
    (sCb) ->
      graphNodes = fs.readFileSync('./raw.out.json')
      graphNodes = JSON.parse(graphNodes)
      rawQueries = graphNodes.map( (e) -> e.replace(/->/g, '.'))
      sCb()
    (sCb) ->
      async.each rawQueries, (rawQuery, eCb) ->
        modelName = rawQuery.split('.')[0]
        query = rawQuery.replace modelName + '.', ''
        thisQuery = collectionQueries[modelName] ||= []
        thisQuery.push query
        eCb()
      , sCb
    (sCb) ->
      content = JSON.stringify collectionQueries, null, 2
      fs.writeFileSync './queries.out.json', content, 'utf-8'
      sCb()
  ], cb

main (err) ->
  throw err if err
  console.log 'Written file at ./queries.out.json'
  process.exit()
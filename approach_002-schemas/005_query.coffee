fs = require 'fs'
SCHEMAS = require './imports.out'
config =
  'collection': null
  'id': null

process.argv.forEach (arg) ->
  paramValuePair = arg.split '='
  name = paramValuePair[0]
  value = paramValuePair[1]

  if Object.keys(config).includes(name)
    config[name] = value
# I left off here ^

main = (cb) ->
  _graphNodes = fs.readFileSync('./raw.out.json')
  _graphNodes = JSON.parse(_graphNodes)
  rawQueries = _graphNodes.map( (e) -> e.replace(/->/g, '.'))
  queries = {}

  rawQueries.forEach (rawQuery) ->
    modelName = rawQuery.split('.')[0]
    query = rawQuery.replace(modelName+'.', '')
    thisQuery = queries[modelName] ||= []
    thisQuery.push(query)
  # console.log queries

main (err) ->
  throw err if err
  console.log 'Done'
process.exit()
SCHEMAS = require './imports.out'
fs = require 'fs'

union_char = '->'

validate = (word='') ->
  return word.indexOf('Id') > -1 #|| word == 'id' || word == '_id'

tree2Graph = (_result=[], _validationFn, tree, carry) ->
  _carry = if carry? then carry else ''

  if typeof tree == "object"
    leaves = Object.keys tree
    union = if _carry.length > 0 then union_char else ''

    for leaf in leaves
      if _validationFn(leaf)
        _result.push _carry+union+leaf
        continue
      else
        tree2Graph _result, _validationFn, tree[leaf], _carry+union+leaf
  else if _validationFn(_carry)
    _result.push _carry
  return _result

graph = tree2Graph [], validate, SCHEMAS
fs.writeFileSync('./raw.out.json', JSON.stringify(graph, null, 2), 'utf-8')
console.log 'saved to ./raw.out.json'

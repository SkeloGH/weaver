SCHEMAS = require './imports.out'
fs = require 'fs'
# {
#     "name": "flare",
#     "children": [{
#         "name": "analytics",
#         "children": [{
#             "name": "cluster",
#             "children": [{

graph = {
  name: "Schemas",
  children: []
}


treeScan = (_tree, _stash, cb) ->
  if typeof _tree == "object"
    leaves = Object.keys _tree
    for leaf in leaves
      cb _stash, leaf, _tree[leaf]

pushNode = (stash, key, value)->
  node = { name: key }

  if typeof value == "object"
    node.children = []

  stash.push node
  treeScan value, node.children, pushNode

treeScan SCHEMAS, graph.children, pushNode

fs.writeFileSync('../view/dendogram/data.out.json', JSON.stringify(graph, null, 2), 'utf-8')
console.log 'saved to ../view/dendogram/data.out.json'

const fs = require('fs');
class Visualizer {

  constructor(props) {
    this.dataSrc   = props.filePath
  }

  cleanNode(elem) {
    let nodes, lastNode, capitalized, clean;
    nodes = elem.split('->')
    lastNode = nodes[nodes.length-1].replace('_','')
    capitalized = lastNode.replace(/^(\w)[1]?/, lastNode.slice(0,1).toUpperCase())
    clean = capitalized.replace('Id','')
    nodes[nodes.length-1] = clean
    return nodes.join('->')+';'
  }

  get data() {
    return JSON.parse(fs.readFileSync(this.dataSrc))
  }

  get graphNodes() {
    return this.data.map(this.cleanNode)
  }

  render() {
    return 'digraph G {\n'+this.graphNodes.join('\n')+'\n}'
  }
}

/*
e.g.: [ "Analytics->scope->tagId" ]
*/
const DATA_SRC = '../view/graphviz/raw.out.json'
let graph = new Visualizer({filePath: DATA_SRC})

fs.writeFileSync('../view/graphviz/clean.out.json', JSON.stringify(graph.graphNodes), 'utf-8')
fs.writeFileSync('../view/graphviz/data.out.gv', graph.render(), 'utf-8')
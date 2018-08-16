const fs = require('fs');
class Visualizer {

  constructor(props) {
    this.dataSrc   = props.filePath
  }

  nodesInElement(elem) {
    let nodes;
    nodes = elem.split('->');
    nodes = nodes.filter(node => node != '0')
    nodes = nodes.map(node => '"'+node+'"')
    return nodes;
  }

  cleanNode(elem) {
    let nodes, lastNode, capitalized, clean;
    nodes = this.nodesInElement(elem);
    lastNode = nodes[nodes.length-1]
    capitalized = lastNode.replace(lastNode[1], lastNode[1].toUpperCase());
    nodes[nodes.length - 1] = capitalized;
    return nodes.join('->')+';'
  }

  get data() {
    return JSON.parse(fs.readFileSync(this.dataSrc))
  }

  get graphNodes() {
    return this.data.map(this.cleanNode.bind(this))
  }

  render() {
    return 'digraph G {\n'+this.graphNodes.join('\n')+'\n}'
  }
}

/*
e.g.: [ "Analytics->scope->tagId" ]
*/
const DATA_SRC = './raw.out.json'
let graph = new Visualizer({filePath: DATA_SRC})

fs.writeFileSync('./clean.out.json', JSON.stringify(graph.graphNodes), 'utf-8')
fs.writeFileSync('./data.out.gv', graph.render(), 'utf-8')
console.log('written ./clean.out.json');
console.log('written ./data.out.gv');

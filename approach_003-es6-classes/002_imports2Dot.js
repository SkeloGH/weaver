const IMPORTS = require( './imports.out' );
const fs = require( 'fs' );
const esprima = require('esprima');

const getInstanceMethodNames = ( obj ) => {
  const proto = Object.getPrototypeOf( obj );
  const names = Object.getOwnPropertyNames( proto );
  return names.filter( name => typeof obj[name] === 'function' );
}

const syntaxTree = (fxn) => {
  return esprima.parseScript(fxn.toString());
}

const isClassDeclaration = (syntaxTree ) => {
  if ('body' in syntaxTree && syntaxTree.body.length === 1) {
    return syntaxTree.body[0].type == esprima.Syntax.ClassDeclaration
  }
  return false
}

const pushNode = (key, obj) => {
  let classname = key.replace(key[0], key[0].toUpperCase());
  let _Constructor = obj[key];
  let methodNames = getInstanceMethodNames(new _Constructor());
  return Array.from(methodNames, (name) => {
    if (name !== "constructor") {
      return classname + '->' + classname + '.' + name;
    }
    return classname;
  });
}

const classesInImports = (importsObj) => {
  let result = []
  Object.keys(importsObj).forEach((key) => {
    let stxTree = syntaxTree(importsObj[key])
    if (isClassDeclaration(stxTree)) {
      result = result.concat(pushNode(key, importsObj))
    }
  })
  return result
}

const obj2Graph = ( _result=[], obj ) => {
  if ( typeof obj == "object" ) {
    _result = _result.concat(classesInImports(obj))
  }
  return _result
}

let graph = obj2Graph( [], IMPORTS );
fs.writeFileSync('./raw.out.json', JSON.stringify(graph, null, 2), 'utf-8');
console.log( 'saved to ./raw.out.json' );
process.exit()

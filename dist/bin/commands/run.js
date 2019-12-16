"use strict";const Debug=require("debug"),shell=require("shelljs"),mongo=require("mongodb"),ObjectId=mongo.ObjectID,{getConfig}=require("../lib/config"),Weaver=require("../../src"),WeaverMongoClient=require("../../src/clients/mongodb"),logging=Debug("Weaver:bin:commands:run");module.exports={name:"run",description:"Runs the app with the loaded configuration",setup:a=>a,parse:a=>{logging(`getting config from argv ${a}`);const b=getConfig(a),c=JSON.stringify(b,null,2);let d=`Running with the current configuration"\n ${c}`;const e=b.queries&&0<b.queries.length,f=b.dataClients&&0<b.dataClients.length;if(f||(d=`Error: dataClients not set, try:
      weaver add [client|query|ignoreField]
      `),e||(d=`Error: queries not set, try:
      weaver run --queries <a document id>
      `),shell.echo(d),!(f&&e))return a;// TODO: need to delegate this conversion to each client
// once starting to add new client families
b.dataClients=b.dataClients.map(a=>-1<a.family.indexOf("mongo")?new WeaverMongoClient(a):a),b.queries=b.queries.map(a=>({_id:ObjectId(a)}));// end TODO
const g=new Weaver(b);return g.run(a=>{logging("Result",a),shell.echo("Done"),g.disconnect(process.exit)}),a}};
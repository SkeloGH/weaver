"use strict";const logging=require("debug")("Weaver:config/clients.js"),WeaverMongoClient=require("../clients/mongodb"),configs=[// This is the DB where queries will be run against.
{type:"source",db:{// remote db access can be achieved through ssh port forwarding
url:"mongodb://localhost:27017",name:"weaver-source-db-example",options:{}},client:{// The list of collection names to avoid querying
ignoreFields:["logs","events","etc"]}},// This is the DB where the results will be stored.
{type:"target",// For each `"target"`, there must be a `"source"` client.
origin:"weaver-source-db-example",db:{url:"mongodb://localhost:27017",name:"weaver-target-db-example",options:{}}}];/**
 * Load up the clients according to your needs, in this case we'll use `WeaverMongoClient`
 * as we want to connect to a MongoDB data source.
 * @todo - Make client options not required.
 */ /**
 * Export the clients, they're required by config/index.js
 * You're all set! 🎉
 */module.exports=configs.map(a=>(logging(`${a.type} config:`,JSON.stringify(a,null,2)),new WeaverMongoClient(a)));
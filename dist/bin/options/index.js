"use strict";const Debug=require("debug"),logging=Debug("Weaver:CLI:options:index"),options={config:{alias:"c",describe:"Displays current configuration if called without arguments, or set the JSON config file destination.",type:"string"},dry:{describe:"Run but don't save.",type:"boolean"},// json: {
//   describe: 'Write the output in the configured JSON file',
//   type: 'boolean',
// },
// 'json-file': {
//   describe: 'The JSON filepath where output will be streamed to',
//   type: 'string',
// },
// limit: {
//   describe: 'The max amount of docs to retrieve',
//   type: 'number',
// },
queries:{alias:"qq",describe:"Document ids to get relationships from, e.g.: 2a3b4c5d6e7f8g9h2a3b4c5d e7f8g9h2a3b4c5d2a3b4c5d6",type:"array"},verbose:{alias:"V",describe:"Enable highest level of logging, same as DEBUG=*",type:"boolean"},version:{alias:"v",describe:"Print version information and quit",type:"boolean"}};logging("options",options),module.exports=options;
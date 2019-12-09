"use strict";const Debug=require("debug"),argv=require("yargs");function InvalidJSONFileError(a){this.message=`
  Error parsing JSON file at ${JSON.stringify(a)}
  Make sure file exists and content is valid JSON`,this.stack=Error().stack}InvalidJSONFileError.prototype=Object.create(Error.prototype),InvalidJSONFileError.prototype.name="InvalidJSONFileError";const verboseMode=()=>argv.parsed.argv.verbose&&Debug.enable("Weaver:*")||!0,isCalledWithParams=()=>2<process.argv.length;// [node, weaver, ...]
module.exports={InvalidJSONFileError,verboseMode,isCalledWithParams};
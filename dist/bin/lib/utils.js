"use strict";

const Debug = require('debug');

const argv = require('yargs');

function InvalidJSONFileError(filePath) {
  this.message = `
  Error parsing JSON file at ${JSON.stringify(filePath)}
  Make sure file exists and content is valid JSON`;
  this.stack = Error().stack;
}

InvalidJSONFileError.prototype = Object.create(Error.prototype);
InvalidJSONFileError.prototype.name = 'InvalidJSONFileError';

const verboseMode = () => argv.parsed.argv.verbose && Debug.enable('Weaver:*') || true;

const isCalledWithParams = () => process.argv.length > 2; // [node, weaver, ...]


module.exports = {
  InvalidJSONFileError,
  verboseMode,
  isCalledWithParams
};
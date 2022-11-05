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

const verboseMode = () => (argv.parsed.argv.verbose && Debug.enable('Weaver:*')) || true;
const isCalledWithParams = () => process.argv.length > 2; // [node, weaver, ...]
const generateId = (options = {}) => {
  const maxlen = options.length ? options.length : 8;
  let rand = `${options.prefix ? options.prefix : ''}`;
  let num = 0;
  while (rand.length < maxlen) {
    num = Math.ceil(Math.random() * 100);
    rand += num;
  }
  rand = `${rand}${options.suffix ? options.suffix : ''}`;
  rand = rand.slice(0, maxlen);
  return rand;
};

module.exports = {
  InvalidJSONFileError,
  generateId,
  verboseMode,
  isCalledWithParams,
};

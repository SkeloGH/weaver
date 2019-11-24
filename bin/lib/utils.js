const Debug = require('debug');
const argv = require('yargs');

const verboseMode = () => (argv.parsed.argv.verbose && Debug.enable('Weaver:*')) || true;
const isCalledWithParams = () => process.argv.length > 2; // [node, weaver, ...]

module.exports = {
  verboseMode,
  isCalledWithParams,
};

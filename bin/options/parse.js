const Debug = require('debug');
const argv = require('yargs');

const { applyConfig } = require('./config');

const logging = Debug('Weaver:parse');

const parseOptions = () => {
  logging(argv.parsed.argv);
  applyConfig(argv.parsed.argv.config);
};


module.exports = parseOptions;

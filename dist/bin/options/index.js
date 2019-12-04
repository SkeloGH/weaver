"use strict";

const Debug = require('debug');

const {
  DEFAULT_CONFIG_PATH
} = require('../lib/constants');

const logging = Debug('Weaver:CLI:options');
const options = {
  config: {
    alias: 'c',
    describe: `Read or set path of config file, default: ${DEFAULT_CONFIG_PATH}`,
    type: 'string'
  },
  dry: {
    describe: 'Run but don\'t save.',
    type: 'boolean'
  },
  info: {
    describe: 'Displays the current settings',
    type: 'boolean'
  },
  json: {
    describe: 'Write the output in the configured JSON file',
    type: 'boolean'
  },
  'json-file': {
    describe: 'The JSON filepath where output will be streamed to',
    type: 'string'
  },
  limit: {
    describe: 'The max amount of docs to retrieve',
    type: 'number'
  },
  verbose: {
    alias: 'V',
    describe: 'Enable highest level of logging, same as DEBUG=*',
    type: 'boolean'
  },
  version: {
    alias: 'v',
    describe: 'Print version information and quit',
    type: 'boolean'
  }
};
logging('options', options);
module.exports = options;
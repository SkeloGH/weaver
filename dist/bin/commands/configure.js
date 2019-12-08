"use strict";

const Debug = require('debug');

const logging = Debug('Weaver:bin:commands:configure');
module.exports = {
  name: 'configure',
  description: 'Interactive configuration wizard',
  setup: yargs => yargs,
  parse: _argv => {
    logging('launch configuration wizard');
    return _argv;
  }
};
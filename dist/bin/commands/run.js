"use strict";

const Debug = require('debug');

const {
  getConfig
} = require('../lib/config');

const Weaver = require('../../src');

const logging = Debug('Weaver:CLI:commands');
module.exports = {
  name: 'run',
  description: 'Runs the app with the loaded configuration',
  setup: yargs => yargs,
  parse: _argv => {
    const config = getConfig(_argv);
    logging('Run with the current configuration', config);
    const weaver = new Weaver(config);
    weaver.run(result => {
      logging('Result', result);
      logging('Done');
      weaver.disconnect(process.exit);
    });
    return _argv;
  }
};
"use strict";

const Debug = require('debug');

const Weaver = require('../../src');

const logging = Debug('Weaver:CLI:commands');
module.exports = {
  name: 'run',
  description: 'Runs the app with the loaded configuration',
  setup: yargs => yargs,
  parse: _argv => {
    logging('run with the current configuration');
    const weaver = new Weaver(require('../../src/config'));
    weaver.run(result => {
      logging('Result', result);
      logging('Done');
      weaver.disconnect(process.exit);
    });
    return _argv;
  }
};
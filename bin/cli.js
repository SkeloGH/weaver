#! /usr/bin/env node
/* eslint-disable no-unused-expressions */
/* eslint-disable no-console */

const Debug = require('debug');
const argv = require('yargs');

const logging = Debug('Weaver:bin:cli');
const options = require('./options');
const cmd = require('./commands');
const { parseOptions } = require('./options/parse');
const {
  verboseMode,
  isCalledWithParams,
} = require('./lib/utils');

Debug.enable('Weaver:*');
argv
  .check(verboseMode)
  .scriptName('weaver')
  .usage('Usage: $0 [OPTIONS] COMMAND [ARG...]')
  .usage('       $0 [ --help | -v | --version ]')
  .options(options)
  .command(cmd.add.name, cmd.add.description, cmd.add.setup, cmd.add.parse)
  .command(cmd.rm.name, cmd.rm.description, cmd.rm.setup, cmd.rm.parse)
  .command(cmd.run.name, cmd.run.description, cmd.run.setup, cmd.run.parse)
  // .command(cmd.cfg.name, cmd.cfg.description, cmd.cfg.setup, cmd.cfg.parse)
  .strict(true)
  .check(isCalledWithParams)
  .fail((msg, err, yargs) => {
    if (err) logging('Error', yargs);
    if (err) throw err; // preserve stack
    if (!isCalledWithParams()) {
      console.error(yargs.help());
    } else {
      console.error(msg);
    }
    process.exit();
  })
  .wrap(argv.terminalWidth())
  .showHelpOnFail(false, 'Specify --help for available options')
  .help()
  .argv;

parseOptions(argv.parsed.argv);

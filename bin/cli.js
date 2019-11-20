#! /usr/bin/env node
/* eslint-disable no-unused-expressions */
/* eslint-disable no-console */

const argv = require('yargs');

const {
  configPath,
  applyConfig,
} = require('./handlers/options');

const isCalledWithParams = () => process.argv.length > 2; // [node, weaver, ...]

argv
  .scriptName('weaver')
  .usage('Usage: $0 [OPTIONS] COMMAND [ARG...]')
  .usage('       $0 [ --help | -v | --version ]')
  .check(isCalledWithParams)
  .fail((msg, err, yargs) => {
    if (err) throw err; // preserve stack
    console.error(yargs.help());
    process.exit(1);
  })
  .option('config', {
    alias: 'c',
    describe: `Location of configuration file\ndefault ${configPath}`,
  })
  .strict(true)
  .showHelpOnFail(false, 'Specify --help for available options')
  .help()
  .argv;

if (!isCalledWithParams) {
  argv.showHelp();
}

const exec = () => {
  const { config } = argv.parsed.argv;
  applyConfig(config);
};

exec();

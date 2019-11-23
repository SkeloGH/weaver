#! /usr/bin/env node
/* eslint-disable no-unused-expressions */
/* eslint-disable no-console */

const Debug = require('debug');
const argv = require('yargs');

const logging = Debug('Weaver:CLI');
const options = require('./options');
const cmd = require('./commands');

const verboseMode = () => (argv.parsed.argv.verbose && Debug.enable('Weaver:*')) || true;
const isCalledWithParams = () => process.argv.length > 2; // [node, weaver, ...]

argv
  .scriptName('weaver')
  .usage('Usage: $0 [OPTIONS] COMMAND [ARG...]')
  .usage('       $0 [ --help | -v | --version ]')
  .check(verboseMode)
  // Options start
  .option('config', {
    alias: 'c',
    describe: `Read or set path of config file\ndefault ${options.configPath}`,
    type: 'string',
  })
  .option('dry', {
    describe: 'Run but don\'t save.',
    type: 'boolean',
  })
  .option('info', {
    describe: 'Displays the current settings',
    type: 'boolean',
  })
  .option('json', {
    describe: 'Write the output in the configured JSON file',
    type: 'boolean',
  })
  .option('json-file', {
    describe: 'The JSON filepath where output will be streamed to',
    type: 'string',
  })
  .option('limit', {
    describe: 'The max amount of docs to retrieve',
    type: 'number',
  })
  .option('verbose', {
    alias: 'V',
    describe: 'Enable highest level of logging, same as DEBUG=*',
    type: 'boolean',
  })
  .option('version', {
    alias: 'v',
    describe: 'Print version information and quit',
    type: 'boolean',
  })
  // Options end
  // Commands start
  .command(cmd.run.name, cmd.run.description, cmd.run.setup, cmd.run.parse)
  .command(cmd.cfg.name, cmd.cfg.description, cmd.cfg.setup, cmd.cfg.parse)
  .command(cmd.add.name, cmd.add.description, cmd.add.setup, cmd.add.parse)
  .command(cmd.remove.name, cmd.remove.description, cmd.remove.setup, cmd.remove.parse)
  // Commands end
  .strict(true)
  .check(isCalledWithParams)
  .fail((msg, err, yargs) => {
    if (err) throw err; // preserve stack
    if (!isCalledWithParams()) {
      console.error(yargs.help());
    } else {
      console.error(msg);
    }
    return yargs;
  })
  .showHelpOnFail(false, 'Specify --help for available options')
  .help()
  .argv;

const exec = () => {
  const {
    config,
    verbose,
    dry,
    info,
  } = argv.parsed.argv;
  logging(config, verbose, dry, info);
  options.applyConfig(config);
};
exec();

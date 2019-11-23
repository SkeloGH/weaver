#! /usr/bin/env node
/* eslint-disable no-unused-expressions */
/* eslint-disable no-console */

const Debug = require('debug');
const argv = require('yargs');

const logging = Debug('Weaver:CLI');
const {
  configPath,
  applyConfig,
} = require('./handlers/options');

const verboseMode = () => {
  if (argv.parsed.argv.verbose) Debug.enable('Weaver:*');
  return true;
};
const isCalledWithParams = () => process.argv.length > 2; // [node, weaver, ...]

argv
  .scriptName('weaver')
  .usage('Usage: $0 [OPTIONS] COMMAND [ARG...]')
  .usage('       $0 [ --help | -v | --version ]')
  .check(verboseMode)
  // Options start
  .option('config', {
    alias: 'c',
    describe: `Read or set path of config file\ndefault ${configPath}`,
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
  .command(
    'run',
    'Runs the app with the loaded configuration',
    (yargs) => yargs,
    (_argv) => {
      logging('run with the current configuration');
      return _argv;
    },
  )
  .command(
    'configure',
    'Interactive configuration wizard',
    (yargs) => yargs,
    (_argv) => {
      logging('launch configuration wizard');
      return _argv;
    },
  )
  .command(
    'add',
    'Interactive creation of client, query or ignoreField',
    (yargs) => {
      const cmd = yargs.command('client', 'Interactive creation of a new client',
        (_yargs) => _yargs,
        (params) => {
          logging('client params', params);
          return params;
        })
        .command('query', 'Interactive creation of a new query',
          (_yargs) => _yargs,
          (params) => {
            logging('query params', params);
            return params;
          })
        .command('ignoreField', 'Interactive creation of a new ignoreField',
          (_yargs) => _yargs,
          (params) => {
            logging('ignoreField params', params);
            return params;
          });
      return cmd;
    },
    (_argv) => {
      logging('_argv', _argv);
      return _argv;
    },
  )
  .command(
    'remove',
    'Interactive removal of clients, queries or ignoreFields',
    (yargs) => {
      const cmd = yargs.command('client', 'Interactive removal of one or more clients',
        (_yargs) => _yargs,
        (params) => {
          logging('client params', params);
          return params;
        })
        .command('query', 'Interactive removal of one or more queries',
          (_yargs) => _yargs,
          (params) => {
            logging('query params', params);
            return params;
          })
        .command('ignoreField', 'Interactive removal of one or more ignoreFields',
          (_yargs) => _yargs,
          (params) => {
            logging('ignoreField params', params);
            return params;
          });
      return cmd;
    },
    (_argv) => {
      logging('_argv', _argv);
      return _argv;
    },
  )
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
  applyConfig(config);
};
exec();

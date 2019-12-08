"use strict";

const CLI_CONFIG = require('../.config');

const {
  getJSONContent,
  validateConfig
} = require('../options/config');

let CLI_ARGS = {};

const readConfigFile = () => {
  let config = {};
  const path = CLI_CONFIG.filePath;
  const isValid = validateConfig(path).valid;

  if (isValid) {
    config = getJSONContent(path);
  }

  return {
    queries: config.queries || null,
    dataClients: config.dataClients || null,
    jsonConfig: config.jsonConfig || null
  };
};

const parseCLIConfig = () => {
  const dataClients = null; // not implemented

  const {
    queries
  } = CLI_ARGS;
  const jsonConfig = CLI_ARGS['json-file'] ? {
    filePath: CLI_ARGS['json-file']
  } : null;
  return {
    queries,
    dataClients,
    jsonConfig
  };
};

const readCLISettings = () => {
  const config = {};
  const stdin = parseCLIConfig();
  config.queries = CLI_CONFIG.queries || stdin.queries;
  config.dataClients = CLI_CONFIG.dataClients || stdin.dataClients;
  config.jsonConfig = CLI_CONFIG.jsonConfig || stdin.jsonConfig;
  return {
    queries: config.queries || null,
    dataClients: config.dataClients || null,
    jsonConfig: config.jsonConfig || null
  };
};

const getConfig = _argv => {
  CLI_ARGS = _argv;
  const fileCfg = readConfigFile();
  const cliCfg = readCLISettings();
  const queries = fileCfg.queries || cliCfg.queries || [];
  const dataClients = fileCfg.dataClients || cliCfg.dataClients || [];
  const jsonConfig = fileCfg.jsonConfig || cliCfg.jsonConfig || {};
  return {
    queries,
    dataClients,
    jsonConfig
  };
};

module.exports = {
  readConfigFile,
  parseCLIConfig,
  readCLISettings,
  getConfig
};
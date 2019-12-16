const fs = require('fs');
const CLI_CONFIG = require('../.config');

const {
  getJSONContent,
  validateConfig,
  isValidConfigObject,
} = require('../options/config');
const { absPathname } = require('../options/shared');

let CLI_ARGS = {};

const readConfigFile = () => {
  let config = {};
  const path = CLI_CONFIG.filePath;
  const isValid = validateConfig(path).valid;
  if (isValid) {
    config = getJSONContent(path);
  }
  return {
    config: config.config || { filePath: null },
    queries: config.queries || null,
    dataClients: config.dataClients || null,
    jsonConfig: config.jsonConfig || null,
  };
};

const parseCLIConfig = () => {
  const dataClients = null; // not implemented
  const { queries } = CLI_ARGS;
  const jsonConfig = CLI_ARGS['json-file']
    ? { filePath: CLI_ARGS['json-file'] }
    : null;

  return {
    queries,
    dataClients,
    jsonConfig,
  };
};

const readCLISettings = () => {
  const stdin = parseCLIConfig();
  const queries = stdin.queries || CLI_CONFIG.queries;
  const dataClients = stdin.dataClients || CLI_CONFIG.dataClients;
  const jsonConfig = stdin.jsonConfig || CLI_CONFIG.jsonConfig;
  return {
    queries: queries || null,
    dataClients: dataClients || null,
    jsonConfig: jsonConfig || null,
  };
};

const getQueries = (fileCfg, cliCfg) => {
  let queries = null;
  if (fileCfg.queries && fileCfg.queries.length > 0) {
    queries = fileCfg.queries;
  }
  if (!queries && cliCfg.queries && cliCfg.queries.length) {
    queries = cliCfg.queries;
  }
  queries = queries || [];
  return queries;
};

const getConfig = (_argv = {}) => {
  CLI_ARGS = _argv;
  const fileCfg = readConfigFile();
  const cliCfg = readCLISettings();
  const { config } = fileCfg;
  const queries = getQueries(fileCfg, cliCfg);
  const dataClients = fileCfg.dataClients || cliCfg.dataClients || [];
  const jsonConfig = fileCfg.jsonConfig || cliCfg.jsonConfig || {};

  return {
    config,
    queries,
    dataClients,
    jsonConfig,
  };
};

const setConfig = (config = {}) => {
  const isValid = isValidConfigObject(config);
  const cfgAbsPath = absPathname(__dirname, './../.config.json');
  if (isValid) {
    try {
      fs.writeFileSync(cfgAbsPath, JSON.stringify(config, null, 2));
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  return false;
};

module.exports = {
  readConfigFile,
  parseCLIConfig,
  readCLISettings,
  getConfig,
  setConfig,
};

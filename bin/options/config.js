const ld = require('lodash');
const fs = require('fs');
const Debug = require('debug');
const shell = require('shelljs');
const {
  DEFAULT_CONFIG_PATH,
  TEST_NODE_ENV,
  REQUIRED_CONFIG_KEYS,
} = require('../lib/constants');

const logging = Debug('Weaver:parse');

const pathExists = (pathname) => {
  try {
    return fs.existsSync(pathname);
  } catch (error) {
    logging(`pathExists:Error ${error}`);
    return false;
  }
};

const getJSONContent = (filePath) => {
  logging(`getJSONContent:filePath ${filePath}`);
  try {
    const content = fs.readFileSync(filePath);
    const parsedContent = JSON.parse(content);
    logging(`getJSONContent:content ${content}`);
    return parsedContent;
  } catch (error) {
    logging(`getJSONContent:Error ${error}`);
    if (error instanceof SyntaxError) console.error('error', error);
    return null;
  }
};

const isJSONFile = (filePath) => {
  const parsedContent = getJSONContent(filePath);
  const isJSONContent = parsedContent instanceof Object;
  return isJSONContent;
};

const isValidConfigObject = (cfg) => {
  const isPlainObject = ld.isPlainObject(cfg);
  const keys = ld.keys(cfg);
  const matchingKeys = ld.intersection(REQUIRED_CONFIG_KEYS, keys);
  return isPlainObject && matchingKeys.length === REQUIRED_CONFIG_KEYS.length;
};

const isValidConfigFile = (filePath) => {
  const isPathString = typeof filePath === 'string';
  const isValidFile = isPathString && pathExists(filePath) && isJSONFile(filePath);
  const content = isValidFile && getJSONContent(filePath);
  const isValidConfig = isValidConfigObject(content);
  return isValidConfig;
};

const applyConfig = (config) => {
  let configFilePath = ''.concat(DEFAULT_CONFIG_PATH);
  let valid = !config && isValidConfigFile(configFilePath);

  if (config) {
    valid = isValidConfigFile(config);
    if (valid) configFilePath = config;
  }
  if (!TEST_NODE_ENV && !valid) {
    shell.echo('Error: Invalid config file!');
    if (isValidConfigFile(DEFAULT_CONFIG_PATH)) {
      shell.echo('Default config file:\n\t', DEFAULT_CONFIG_PATH);
    } else {
      shell.echo('Suggestion:\n\tweaver --init');
    }
  }

  if (!TEST_NODE_ENV) shell.echo('Configuration file:\n\t', configFilePath);
  return configFilePath;
};

module.exports = {
  applyConfig,
  pathExists,
  getJSONContent,
  isJSONFile,
  isValidConfigFile,
  isValidConfigObject,
};

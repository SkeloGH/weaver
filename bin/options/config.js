const ldLang = require('lodash/lang');
const ldArray = require('lodash/array');
const ldObject = require('lodash/object');
const fs = require('fs');
const Debug = require('debug');
const shell = require('shelljs');

const {
  TEST_NODE_ENV,
  REQUIRED_CONFIG_KEYS,
} = require('../lib/constants');
const { InvalidJSONFileError } = require('../lib/utils');
const { cfgAbsPath, getJSONContent, getCLIJSONContent } = require('./shared');

const logging = Debug('Weaver:bin:options:config');

const pathExists = (pathname) => {
  try {
    return fs.existsSync(pathname);
  } catch (error) {
    logging(`pathExists:Error ${error}`);
    return false;
  }
};

const isJSONFile = (filePath) => {
  const parsedContent = getJSONContent(filePath);
  const isJSONContent = parsedContent instanceof Object;
  return isJSONContent;
};

const isValidConfigObject = (cfg) => {
  const isPlainObject = ldLang.isPlainObject(cfg);
  const keys = ldObject.keys(cfg);
  const matchingKeys = ldArray.intersection(REQUIRED_CONFIG_KEYS, keys);
  return isPlainObject && matchingKeys.length === REQUIRED_CONFIG_KEYS.length;
};

const validateConfig = (filePath) => {
  const isPathString = typeof filePath === 'string';
  const isValidPath = pathExists(filePath);
  const isJSON = isJSONFile(filePath);
  const isValidFile = isPathString && isValidPath && isJSON;
  const content = isValidFile && getJSONContent(filePath);
  const isValidConfig = isValidConfigObject(content);
  return {
    valid: isValidFile && isValidConfig,
    isValidConfig,
    isPathString,
    isValidPath,
    isJSON,
    isValidFile,
  };
};

const showConfig = () => {
  const CFG = getCLIJSONContent();
  const cfgString = JSON.stringify(CFG, null, 2);
  if (!TEST_NODE_ENV) shell.echo(cfgString);
  return false;
};

const validationFeedback = (validation, filePath) => {
  if (!TEST_NODE_ENV && !validation.valid) {
    shell.echo('Error: Invalid config file path!', filePath);
    shell.echo(validation);
    throw new InvalidJSONFileError(filePath);
  }
};

const saveConfigPath = (configFilePath) => {
  const CFG = getCLIJSONContent();
  const configContent = ldObject.assign({}, CFG, { config: { filePath: configFilePath } });
  try {
    fs.writeFileSync(cfgAbsPath, JSON.stringify(configContent, null, 2));
    if (!TEST_NODE_ENV) shell.echo('Updated config file:\n\t', configContent.config);
    return true;
  } catch (error) {
    if (!TEST_NODE_ENV) shell.echo('Couldn\'t update config file', error);
    return false;
  }
};

const applyConfig = (configFilePath) => {
  const validated = validateConfig(configFilePath);
  validationFeedback(validated, configFilePath);
  if (validated.valid) saveConfigPath(configFilePath);
  return configFilePath;
};

module.exports = {
  pathExists,
  isJSONFile,
  isValidConfigObject,
  validateConfig,
  showConfig,
  validationFeedback,
  saveConfigPath,
  applyConfig,
};

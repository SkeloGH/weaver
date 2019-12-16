const ld = require('lodash');
const fs = require('fs');
const Debug = require('debug');
const shell = require('shelljs');

const CFG = require('../.config');
const {
  TEST_NODE_ENV,
  REQUIRED_CONFIG_KEYS,
} = require('../lib/constants');
const { InvalidJSONFileError } = require('../lib/utils');
const { absPathname } = require('./shared');


const logging = Debug('Weaver:bin:options:config');

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
    const errorName = error.constructor.prototype.name.split(' ')[0];
    const handledErrs = ['SyntaxError', 'TypeError'];
    if (handledErrs.indexOf(errorName)) return null;
    throw error;
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
  const cfgAbsPath = absPathname(__dirname, './../.config.json');
  const configContent = ld.assign({}, CFG, { config: { filePath: configFilePath } });
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
  getJSONContent,
  isJSONFile,
  isValidConfigObject,
  validateConfig,
  showConfig,
  validationFeedback,
  saveConfigPath,
  applyConfig,
};

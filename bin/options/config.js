const Debug = require('debug');
const shell = require('shelljs');
const { CONFIG_PATH } = require('../lib/constants');

const logging = Debug('Weaver:parse');

module.exports = (config) => {
  const configFilePath = ''.concat(CONFIG_PATH);
  // if (!config) return;
  logging('current CONFIG_PATH', CONFIG_PATH);
  console.log(config);

  // validate path
  // - path and file exist
  // - file format is correct
  // - file content is valid
  // if (typeof config === 'string') {
  //   CONFIG_PATH = config;
  // }
  shell.echo('configuration file path:', configFilePath);
  return configFilePath;
};

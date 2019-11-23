const Debug = require('debug');
const shell = require('shelljs');

const logging = Debug('Weaver:CLI:commands');

const homePath = process.env.PWD.replace(process.env.HOME, '~');
let configPath = `${homePath}/src/config/index.js`;

const applyConfig = (config) => {
  if (!config) return;
  logging('current configPath', configPath);
  // validate path
  // - path and file exist
  // - file format is correct
  // - file content is valid
  if (typeof config === 'string') {
    configPath = config;
  }
  shell.echo('configuration file path:', configPath);
};

module.exports = {
  configPath,
  applyConfig,
};

const shell = require('shelljs');

const homePath = process.env.PWD.replace(process.env.HOME, '~');
let configPath = `${homePath}/src/config/index.js`;

const applyConfig = (config) => {
  if (!config) return;
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

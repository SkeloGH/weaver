const shell = require('shelljs');

let configPath = `${process.env.PWD}/src/config/index.js`;

const applyConfig = (config) => {
  if (!config) return;
  if (typeof config === 'string') {
    configPath = config;
  }
  shell.echo('configuration file path:', configPath);
};

module.exports = {
  configPath,
  applyConfig,
};

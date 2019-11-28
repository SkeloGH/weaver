const homedir = require('os').homedir();

module.exports = {
  DEFAULT_CONFIG_PATH: `${homedir}/.weaver.json`,
  TEST_NODE_ENV: process.env.NODE_ENV === 'test',
  REQUIRED_CONFIG_KEYS: ['dataClients', 'queries'],
};

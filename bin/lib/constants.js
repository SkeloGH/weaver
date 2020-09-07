const { absPathname } = require('../options/shared');

module.exports = {
  CFG_ABS_PATH: absPathname(__dirname, './../.config.json'),
  REQUIRED_CONFIG_KEYS: ['dataClients', 'queries'],
  TEST_NODE_ENV: process.env.NODE_ENV === 'test',
};

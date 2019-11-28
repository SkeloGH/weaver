
module.exports = {
  TEST_NODE_ENV: process.env.NODE_ENV === 'test',
  REQUIRED_CONFIG_KEYS: ['dataClients', 'queries'],
};

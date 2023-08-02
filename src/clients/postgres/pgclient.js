import { newDb } from 'pg-mem';

const { Client } = require('pg');

module.exports = {
  getPGClient: (options) => {
    let pgClient = Client;

    if (options.useMock === true) {
      pgClient = newDb().adapters.createPgNative();
    }
    return pgClient;
  },
};

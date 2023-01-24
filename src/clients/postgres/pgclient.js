import { newDb } from 'pg-mem';

const { Client } = require('pg');

const { NODE_ENV } = process.env;
const pgClient = NODE_ENV === 'test' ? newDb().adapters.createPgNative() : Client;

module.exports = {
  Client: pgClient,
};

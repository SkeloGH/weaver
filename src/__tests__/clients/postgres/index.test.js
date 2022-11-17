const { WeaverPostgresClient } = require('../../../clients/postgres');
const {
  mockSourceClientConfig,
  // mockTargetClientConfig,
} = require('../../config/clients/postgres');

describe('WeaverPostgresClient module tests', () => {
  const config = mockSourceClientConfig;
  const clientAPI = new WeaverPostgresClient(config);
  let dbClient;

  test('it lists out client properties', () => {
    expect(clientAPI.logging).not.toBe(undefined);
    expect(clientAPI.type).not.toBe(undefined);
    expect(clientAPI.config).not.toBe(undefined);
    expect(clientAPI.ignoreFields).not.toBe(undefined);
  });

  test('client connects', async () => {
    dbClient = await clientAPI.connect();
    const query = await dbClient.query('SELECT NOW() as now');

    expect(dbClient.readyForQuery).toBe(true);
    expect(query.rows).not.toBe(undefined);
    expect(query).not.toBe(undefined);
  });

  test.skip('client disconnects', async () => {
    const coverage = false;
    expect(coverage).toBe(true);
  });

  test.skip('client query', () => {
    const coverage = false;
    expect(coverage).toBe(true);
  });

  test.skip('client get data', () => {
    const coverage = false;
    expect(coverage).toBe(true);
  });

  test.skip('client onError', () => {
    const coverage = false;
    expect(coverage).toBe(true);
  });

  test.skip('client digest', () => {
    const coverage = false;
    expect(coverage).toBe(true);
  });

  test.skip('client saveDocument', () => {
    const coverage = false;
    expect(coverage).toBe(true);
  });

  test.skip('client handleSavedDocument', () => {
    const coverage = false;
    expect(coverage).toBe(true);
  });
});

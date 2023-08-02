const { WeaverPostgresClient } = require('../../../clients/postgres');
const {
  mockSourceClientConfig,
  // mockTargetClientConfig,
} = require('../../config/clients/postgres');

describe('WeaverPostgresClient module tests', () => {
  test('it lists out client properties', () => {
    const config = mockSourceClientConfig;
    const client = new WeaverPostgresClient(config);
    expect(client.logging).not.toBe(undefined);
    expect(client.type).not.toBe(undefined);
    expect(client.config).not.toBe(undefined);
    expect(client.ignoreFields).not.toBe(undefined);
  });

  test('client connects', async () => {
    const config = mockSourceClientConfig;
    config.useMock = false; // pg-mem doesn't support connect method, using pg instead
    const client = new WeaverPostgresClient(config);
    const dbClient = await client.connect();
    console.log(dbClient);
    expect(dbClient.readyForQuery).toBe(true);
    // dbClient.end();
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

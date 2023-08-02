const WeaverMongoClient = require('../../../clients/mongodb');
const {
  mockSourceClientConfig,
  // mockTargetClientConfig,
} = require('../../config/clients/mongodb');

describe('WeaverMongoClient module tests', () => {
  test('it lists out client properties', () => {
    const config = mockSourceClientConfig;
    const client = new WeaverMongoClient(config);
    expect(client.logging).not.toBe(undefined);
    expect(client.type).not.toBe(undefined);
    expect(client.config).not.toBe(undefined);
    expect(client.ignoreFields).not.toBe(undefined);
  });

  test.skip('client connect', () => {
    const coverage = false;
    expect(coverage).toBe(true);
  });

  test.skip('client disconnect', () => {
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

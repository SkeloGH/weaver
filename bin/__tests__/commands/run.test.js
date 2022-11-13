const ObjectId = require('bson-objectid');

const WeaverMongoClient = require('../../../src/clients/mongodb');
const run = require('../../commands/run');
const {
  _isValidConfig,
  _parseClients,
  _parseQueries,
  parse,
} = require('../../commands/run/index');

describe('weaver-cli run command integrity', () => {
  test('Command has the expected properties', () => {
    expect(run).not.toBe(undefined);
    expect(run.name).not.toBe(undefined);
    expect(run.description).not.toBe(undefined);
    expect(run.setup).toBeInstanceOf(Function);
    expect(run.parse).toBeInstanceOf(Function);
  });

  test('Command options parsing', () => {
    expect(parse).toBeInstanceOf(Function);
    expect(parse({})).toMatchObject({});
  });
});

describe('weaver-cli MongoDB options and client parsing', () => {
  const validType = 'source';
  const validDbURL = 'test://';
  const validDbName = 'test';
  const validDataClient = {
    family: 'mongodb',
    type: validType,
    db: {
      url: validDbURL,
      name: validDbName,
      options: {},
    },
  };
  const validDataClients = [validDataClient];
  const validQuery = '507f1f77bcf86cd799439011';
  const validQueries = [validQuery];
  const validConfig = {
    queries: validQueries,
    dataClients: validDataClients,
  };

  test('weaver-cli MongoDB client parsing', () => {
    const parsedClients = _parseClients(validDataClients);

    expect(_parseClients).toBeInstanceOf(Function);
    expect(parsedClients).toBeInstanceOf(Array);

    parsedClients.forEach((client) => {
      expect(client).toBeInstanceOf(WeaverMongoClient);
    });
  });

  test('weaver-cli MongoDB query parsing', () => {
    const parsedQueries = _parseQueries(validQueries);

    expect(_parseQueries).toBeInstanceOf(Function);
    expect(parsedQueries).toBeInstanceOf(Array);
    parsedQueries.forEach((query) => {
      expect(query._id).toBeInstanceOf(ObjectId);
    });
  });

  test('weaver-cli MongoDB options validation', () => {
    const invalidConfig1 = { queries: [], dataClients: [] };
    const invalidConfig2 = { queries: {}, dataClients: {} };
    const invalidConfig3 = { queries: 'any', dataClients: 'any' };
    const invalidConfig4 = { other: 'value' };
    const expectedWhenValid = { validConfig: true, hasQueries: true, hasDataClients: true };
    const expectedWhenInvalid = { validConfig: false, hasQueries: false, hasDataClients: false };

    expect(_isValidConfig).toBeInstanceOf(Function);
    expect(_isValidConfig(invalidConfig1)).toMatchObject(expectedWhenInvalid);
    expect(_isValidConfig(invalidConfig2)).toMatchObject(expectedWhenInvalid);
    expect(_isValidConfig(invalidConfig3)).toMatchObject(expectedWhenInvalid);
    expect(_isValidConfig(invalidConfig4)).toMatchObject(expectedWhenInvalid);
    expect(_isValidConfig(validConfig)).toMatchObject(expectedWhenValid);
  });
});

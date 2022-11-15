const ObjectId = require('bson-objectid');
const uuid = require('uuid');
const WeaverMongoClient = require('../../../src/clients/mongodb');
// const WeaverPostgresClient = require('../../../src/clients/postgres');
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
  const family = 'mongodb';
  const validDataSource = {
    family,
    type: 'source',
    db: {
      url: null,
      name: 'test-db-source',
      options: {},
    },
  };
  const validDataTarget = {
    family,
    type: 'target',
    db: {
      url: null,
      name: 'test-db-target',
      options: {},
    },
  };
  const validDataSources = [validDataSource, validDataTarget];
  const validQuery = '507f1f77bcf86cd799439011';
  const validQueries = [validQuery];
  const validConfig = {
    queries: validQueries,
    dataClients: validDataSources,
  };

  test('weaver-cli MongoDB client parsing', () => {
    const parsedClients = _parseClients(validDataSources);

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

describe('weaver-cli Postgres options and client parsing', () => {
  const family = 'postgres';
  const validType = 'target';
  const validDbURL = 'postgres://username:password@host:port/database';
  const validDbName = 'test';
  const validDataSource = {
    family,
    type: validType,
    db: {
      url: validDbURL,
      name: validDbName,
      options: {},
    },
  };
  const validDataSources = [validDataSource];
  const validQuery = 'f343667d-f04f-418e-a12e-9ddc87a31e75';
  const validQueries = [validQuery];
  const validConfig = {
    queries: validQueries,
    dataClients: validDataSources,
  };

  test('weaver-cli Postgres query parsing', () => {
    const parsedQueries = _parseQueries(validQueries);

    expect(_parseQueries).toBeInstanceOf(Function);
    expect(parsedQueries).toBeInstanceOf(Array);
    parsedQueries.forEach((query) => {
      expect(uuid.validate(uuid.stringify(query._uuid))).toBe(true);
    });
  });

  // test('weaver-cli Postgres client parsing', () => {
  //   const parsedClients = _parseClients(validDataSources);

  //   expect(_parseClients).toBeInstanceOf(Function);
  //   expect(parsedClients).toBeInstanceOf(Array);

  //   parsedClients.forEach((client) => {
  //     expect(client).toBeInstanceOf(WeaverPostgresClient);
  //   });
  // });

  test('weaver-cli Postgres options validation', () => {
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

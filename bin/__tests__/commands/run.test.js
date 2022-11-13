const run = require('../../commands/run');
const {
  _isValidConfig,
  parse,
} = require('../../commands/run/index');

describe('weaver run command tests', () => {
  test('Command has the expected properties', () => {
    expect(run).not.toBe(undefined);
    expect(run.name).not.toBe(undefined);
    expect(run.description).not.toBe(undefined);
    expect(run.setup).toBeInstanceOf(Function);
    expect(run.parse).toBeInstanceOf(Function);
  });

  test('Command parsing', () => {
    expect(parse).toBeInstanceOf(Function);
    expect(parse({})).toMatchObject({});
  });
  test('Command options validation', () => {
    const valid = {
      queries: ['507f1f77bcf86cd799439011'],
      dataClients: [{
        type: 'source',
        db: {
          url: 'test://',
          name: 'test',
        },
      }],
    };
    const invalid1 = { queries: [], dataClients: [] };
    const invalid2 = { queries: {}, dataClients: {} };
    const invalid3 = { queries: 'any', dataClients: 'any' };
    const invalid4 = { other: 'value' };
    const expectedWhenValid = { validConfig: true, hasQueries: true, hasDataClients: true };
    const expectedWhenInvalid = { validConfig: false, hasQueries: false, hasDataClients: false };

    expect(_isValidConfig).toBeInstanceOf(Function);
    expect(_isValidConfig(invalid1)).toMatchObject(expectedWhenInvalid);
    expect(_isValidConfig(invalid2)).toMatchObject(expectedWhenInvalid);
    expect(_isValidConfig(invalid3)).toMatchObject(expectedWhenInvalid);
    expect(_isValidConfig(invalid4)).toMatchObject(expectedWhenInvalid);
    expect(_isValidConfig(valid)).toMatchObject(expectedWhenValid);
  });
});

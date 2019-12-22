const importedModule = require('../../../commands/add/client');

const validFamily = 'mongodb';
const validOrigin = 'whatever';
const validTypeSource = 'source';
const validTypeTarget = 'target';
const validName = 'anyName';
const validUrl = 'mongodb://localhost:27017';
const validBaseClient = {
  family: validFamily,
  name: validName,
  url: validUrl,
};
const validSourceClient = {
  type: validTypeSource,
  ...validBaseClient,
};
const validTargetClient = {
  type: validTypeTarget,
  origin: validOrigin,
  ...validBaseClient,
};

describe('weaver add client command tests', () => {
  test('Base behavior', () => {
    expect(importedModule).not.toBe(undefined);
  });
  test('Methods coverage', () => {
    const coveredMethods = [
      'addClient',
      'clientExists',
      'commandName',
      'commandDesc',
      'commandSpec',
      'commandHandler',
      'isSameFamily',
      'isSameType',
      'isSameName',
      'validateParams',
      'validateConfig',
    ];
    const filter = (k) => coveredMethods.indexOf(k) < 0;
    const uncoveredMethods = Object.keys(importedModule).filter(filter);
    expect(uncoveredMethods.length).toBe(0);
  });
});

describe('addClient', () => {
  test('returns false if config is undefined', () => {
    const arg1 = undefined;
    const expected = false;
    const result = importedModule.addClient(arg1);
    expect(result).toBe(expected);
  });
  test('returns false if config is empty obj', () => {
    const arg1 = {};
    const expected = false;
    const result = importedModule.addClient(arg1);
    expect(result).toBe(expected);
  });
  test('returns false if config is invalid', () => {
    const case1 = {
      family: '', origin: '', type: '', name: '', url: '',
    };
    const case2 = {
      family: 0, origin: null, type: false, name: null, url: undefined,
    };
    const case3 = {
      family: validFamily,
      origin: null,
      type: validTypeTarget,
      name: validName,
      url: validUrl,
    };
    const expected = false;

    const result1 = importedModule.addClient(case1);
    const result2 = importedModule.addClient(case2);
    const result3 = importedModule.addClient(case3);

    expect(result1).toBe(expected);
    expect(result2).toBe(expected);
    expect(result3).toBe(expected);
  });
  test('returns the new config object if config is valid', () => {
    const result1 = importedModule.addClient(validTargetClient);
    const result2 = importedModule.addClient(validSourceClient);

    expect(result1.config).not.toBe(undefined);
    expect(result1.dataClients).not.toBe(undefined);
    expect(result1.dataClients[0].db.name).toBe(validName);
    expect(result1.dataClients[0].db.url).toBe(validUrl);
    expect(result1.dataClients[0].family).toBe(validFamily);
    expect(result1.dataClients[0].origin).toBe(validOrigin);
    expect(result1.dataClients[0].type).toBe(validTypeTarget);
    expect(result1.jsonConfig).not.toBe(undefined);
    expect(result1.queries).not.toBe(undefined);

    expect(result2.config).not.toBe(undefined);
    expect(result2.dataClients).not.toBe(undefined);
    expect(result2.dataClients[0].db.name).toBe(validName);
    expect(result2.dataClients[0].db.url).toBe(validUrl);
    expect(result2.dataClients[0].family).toBe(validFamily);
    expect(result2.dataClients[0].origin).toBe(undefined);
    expect(result2.dataClients[0].type).toBe(validTypeSource);
    expect(result2.jsonConfig).not.toBe(undefined);
    expect(result2.queries).not.toBe(undefined);
  });
});

describe('clientExists', () => {
  test('returns false if not already saved', () => {
    const expected = false;
    const result1 = importedModule.clientExists(validSourceClient);
    const result2 = importedModule.clientExists(validTargetClient);

    expect(result1.exists).toBe(expected);
    expect(result2.exists).toBe(expected);
  });
  // test('returns true if already saved', () => {
  //   const expected = false;
  //   const result1 = importedModule.clientExists(validSourceClient);
  //   const result2 = importedModule.clientExists(validTargetClient);

  //   expect(result1.exists).toBe(expected);
  //   expect(result2.exists).toBe(expected);
  // });
});

// describe('commandName', () => {
//   test('commandName', () => {
//     const case1 = null;
//     const expected = null;
//     const result1 = importedModule.commandName(case1);
//     expect(result1).toBe(expected);
//   });
// });

// describe('commandDesc', () => {
//   test('commandDesc', () => {
//     const case1 = null;
//     const expected = null;
//     const result1 = importedModule.commandDesc(case1);
//     expect(result1).toBe(expected);
//   });
// });

// describe('commandSpec', () => {
//   test('commandSpec', () => {
//     const case1 = null;
//     const expected = null;
//     const result1 = importedModule.commandSpec(case1);
//     expect(result1).toBe(expected);
//   });
// });

// describe('commandHandler', () => {
//   test('commandHandler', () => {
//     const case1 = null;
//     const expected = null;
//     const result1 = importedModule.commandHandler(case1);
//     expect(result1).toBe(expected);
//   });
// });

// describe('isSameFamily', () => {
//   test('isSameFamily', () => {
//     const case1 = null;
//     const expected = null;
//     const result1 = importedModule.isSameFamily(case1);
//     expect(result1).toBe(expected);
//   });
// });

// describe('isSameType', () => {
//   test('isSameType', () => {
//     const case1 = null;
//     const expected = null;
//     const result1 = importedModule.isSameType(case1);
//     expect(result1).toBe(expected);
//   });
// });

// describe('isSameName', () => {
//   test('isSameName', () => {
//     const case1 = null;
//     const expected = null;
//     const result1 = importedModule.isSameName(case1);
//     expect(result1).toBe(expected);
//   });
// });

// describe('validateParams', () => {
//   test('validateParams', () => {
//     const case1 = null;
//     const expected = null;
//     const result1 = importedModule.validateParams(case1);
//     expect(result1).toBe(expected);
//   });
// });

// describe('validateConfig', () => {
//   test('validateConfig', () => {
//     const case1 = null;
//     const expected = null;
//     const result1 = importedModule.validateConfig(case1);
//     expect(result1).toBe(expected);
//   });
// });

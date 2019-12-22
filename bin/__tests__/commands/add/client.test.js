const importedModule = require('../../../commands/add/client');
const { getConfig, setConfig } = require('../../../lib/config');

const { addClient, clientExists } = importedModule;
const validFamily = 'mongodb';
const validTypeSource = 'source';
const validTypeTarget = 'target';
const validSourceName = 'my-source-db';
const validTargetName = 'my-target-db';
const validOrigin = validSourceName;
const validUrl = 'mongodb://localhost:27017';
const validBaseClient = {
  family: validFamily,
  url: validUrl,
};
const validSourceClient = {
  type: validTypeSource,
  name: validSourceName,
  ...validBaseClient,
};
const validTargetClient = {
  type: validTypeTarget,
  name: validTargetName,
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
  describe('returns false if config is invalid', () => {
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
    test('returns false if config is invalid, mix', () => {
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
        name: validSourceName,
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
  });

  describe('returns the new config object if clients are valid', () => {
    const initialConfig = { ...getConfig() };
    afterEach(() => { setConfig(initialConfig); });

    test('returns the new config object if source is valid', () => {
      const result = addClient(validSourceClient);
      expect(result.config).not.toBe(undefined);
      expect(result.dataClients).not.toBe(undefined);
      expect(result.dataClients[0].db.name).toBe(validSourceName);
      expect(result.dataClients[0].db.url).toBe(validUrl);
      expect(result.dataClients[0].family).toBe(validFamily);
      expect(result.dataClients[0].origin).toBe(undefined);
      expect(result.dataClients[0].type).toBe(validTypeSource);
      expect(result.jsonConfig).not.toBe(undefined);
      expect(result.queries).not.toBe(undefined);
    });
    test('returns the new config object if target is valid', () => {
      const result = addClient(validTargetClient);
      expect(result.config).not.toBe(undefined);
      expect(result.dataClients).not.toBe(undefined);
      expect(result.dataClients[0].db.name).toBe(validTargetName);
      expect(result.dataClients[0].db.url).toBe(validUrl);
      expect(result.dataClients[0].family).toBe(validFamily);
      expect(result.dataClients[0].origin).toBe(validOrigin);
      expect(result.dataClients[0].type).toBe(validTypeTarget);
      expect(result.jsonConfig).not.toBe(undefined);
      expect(result.queries).not.toBe(undefined);
    });
  });
});

describe('clientExists', () => {
  describe('returns false if not already saved', () => {
    test('returns false if not already saved', () => {
      const expected = false;
      const result1 = clientExists(validSourceClient);
      const result2 = clientExists(validTargetClient);

      expect(result1.exists).toBe(expected);
      expect(result2.exists).toBe(expected);
    });
  });
  describe('returns true if already saved', () => {
    const initialConfig = { ...getConfig() };
    beforeAll(() => {
      const sourceClient = addClient(validSourceClient);
      setConfig(sourceClient);

      const targetClient = addClient(validTargetClient);
      setConfig(targetClient);
    });
    afterAll(() => { setConfig(initialConfig); });

    test('returns true if already saved', () => {
      const expected = true;
      const result1 = importedModule.clientExists(validSourceClient);
      const result2 = importedModule.clientExists(validTargetClient);

      expect(result1.exists).toBe(expected);
      expect(result2.exists).toBe(expected);
    });
  });
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

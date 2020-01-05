const { removeClients } = require('../../../commands/remove/client');
const { addClient } = require('../../../commands/add/client');
const { addIgnores } = require('../../../commands/add/ignore');
const importedModule = require('../../../commands/remove/ignore');
const { getConfig, setConfig } = require('../../../lib/config');

const { removeIgnores, commandHandler } = importedModule;
const {
  validFamily,
  validTypeSource,
  validSourceName,
  validUrl,
  validSourceClient,
} = require('../../__mock__/constants');

const generateParams = () => {
  const CFG = { ...getConfig() };
  const clientid = CFG.dataClients[0].clientId;
  const testNS = 'test';
  const namespaces = [testNS];
  const params = { clientid, namespaces, testNS };
  return params;
};

describe('weaver remove ignore command tests', () => {
  test('Base behavior', () => {
    expect(importedModule).not.toBe(undefined);
  });
  test('Methods coverage', () => {
    const coveredMethods = [
      'removeIgnores',
      'commandName',
      'commandDesc',
      'commandSpec',
      'commandHandler',
    ];
    const filter = (k) => coveredMethods.indexOf(k) < 0;
    const uncoveredMethods = Object.keys(importedModule).filter(filter);
    expect(uncoveredMethods.length).toBe(0);
  });
});

describe('removeIgnores', () => {
  describe('returns the new config object if params are valid', () => {
    let initialConfig = {};
    beforeAll(() => {
      initialConfig = { ...getConfig() };
      const clientIds = initialConfig.dataClients.map((c) => c.clientId);
      if (clientIds) {
        const freshCfg = removeClients({ clientIds });
        setConfig(freshCfg);
      }
      const sourceClient = addClient(validSourceClient);
      setConfig(sourceClient);
      const params = generateParams();
      const newCfg = addIgnores(params);
      setConfig(newCfg);
    });
    afterAll(() => { setConfig(initialConfig); });

    test('returns the new config object if ignores are valid', () => {
      const params = generateParams();
      const result = removeIgnores(params);

      expect(result.config).not.toBe(undefined);
      expect(result.dataClients).not.toBe(undefined);
      expect(result.dataClients[0].db.name).toBe(validSourceName);
      expect(result.dataClients[0].db.url).toBe(validUrl);
      expect(result.dataClients[0].family).toBe(validFamily);
      expect(result.dataClients[0].origin).toBe(undefined);
      expect(result.dataClients[0].type).toBe(validTypeSource);
      expect(result.dataClients[0].client).not.toBe(undefined);
      expect(result.dataClients[0].client.ignoreFields).not.toBe(undefined);
      expect(result.dataClients[0].client.ignoreFields.length).toBe(0);
      expect(result.jsonConfig).not.toBe(undefined);
      expect(result.queries).not.toBe(undefined);
    });
  });
});
describe('commandHandler', () => {
  describe('returns the new config object if params are valid', () => {
    let initialConfig = {};
    beforeAll(() => {
      initialConfig = { ...getConfig() };
      const clientIds = initialConfig.dataClients.map((c) => c.clientId);
      if (clientIds) {
        const freshCfg = removeClients({ clientIds });
        setConfig(freshCfg);
      }
      const sourceClient = addClient(validSourceClient);
      setConfig(sourceClient);
    });
    afterAll(() => { setConfig(initialConfig); });

    test('returns the new config object if ignores are valid', () => {
      const params = generateParams();
      const result = commandHandler(params);

      expect(result).toBe(params);
    });
  });
});

const { removeClients } = require('../../../commands/remove/client');
const { addClient } = require('../../../commands/add/client');
const importedModule = require('../../../commands/add/ignore');
const { getConfig, setConfig } = require('../../../lib/config');

const { addIgnores } = importedModule;
const {
  validFamily,
  validTypeSource,
  validSourceName,
  validUrl,
  validSourceClient,
} = require('../../__mock__/constants');

describe('weaver add ignore command tests', () => {
  test('Base behavior', () => {
    expect(importedModule).not.toBe(undefined);
  });
  test('Methods coverage', () => {
    const coveredMethods = [
      'addIgnores',
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

describe('addIgnores', () => {
  describe('returns the new config object if params are valid', () => {
    const initialConfig = { ...getConfig() };
    beforeAll(() => {
      const clientIds = initialConfig.dataClients.map((c) => c.clientId);
      const freshCfg = removeClients({ clientIds });
      setConfig(freshCfg);
      const sourceClient = addClient(validSourceClient);
      setConfig(sourceClient);
    });
    afterAll(() => { setConfig(initialConfig); });

    test('returns the new config object if ignores are valid', () => {
      const CFG = { ...getConfig() };
      const clientid = CFG.dataClients[0].clientId;
      const testNS = 'test';
      const namespaces = [testNS];
      const result = addIgnores({ clientid, namespaces });

      expect(result.config).not.toBe(undefined);
      expect(result.dataClients).not.toBe(undefined);
      expect(result.dataClients[0].db.name).toBe(validSourceName);
      expect(result.dataClients[0].db.url).toBe(validUrl);
      expect(result.dataClients[0].family).toBe(validFamily);
      expect(result.dataClients[0].origin).toBe(undefined);
      expect(result.dataClients[0].type).toBe(validTypeSource);
      expect(result.dataClients[0].client).not.toBe(undefined);
      expect(result.dataClients[0].client.ignoreFields).not.toBe(undefined);
      expect(result.dataClients[0].client.ignoreFields[0]).toBe(testNS);
      expect(result.jsonConfig).not.toBe(undefined);
      expect(result.queries).not.toBe(undefined);
    });
  });
});

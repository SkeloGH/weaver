const {
  commandDesc,
  commandHandler,
  commandName,
  commandSpec,
  removeClients,
} = require('../../../commands/remove/client');
const { addClient } = require('../../../commands/add/client');
const { getConfig, setConfig } = require('../../../lib/config');
const {
  validSourceClient,
  validTargetClient,
} = require('../../__mock__/constants');

describe('weaver remove command tests', () => {
  describe('Exports consistency', () => {
    test('Base behavior', () => {
      expect(commandDesc).not.toBe(undefined);
      expect(commandHandler).not.toBe(undefined);
      expect(commandName).not.toBe(undefined);
      expect(commandSpec).not.toBe(undefined);
      expect(removeClients).not.toBe(undefined);
    });
  });
  describe('removeClients', () => {
    const CFG = { ...getConfig() };
    let sourceClientId;
    let targetClientId;
    beforeEach(() => {
      const addedSource = addClient(validSourceClient);
      sourceClientId = addedSource.dataClients[0].clientId;
      setConfig(addedSource);

      const addedTarget = addClient(validTargetClient);
      targetClientId = addedTarget.dataClients[1].clientId;
      setConfig(addedTarget);
    });
    afterEach(() => {
      setConfig(CFG);
    });
    test('returns the saved configuration when input is invalid', () => {
      const _CFG = JSON.stringify({ ...getConfig() });
      const invalidCase1 = 'invalidClientId';
      const invalidCase2 = '';
      const invalidCase3 = null;
      const resultInvalid1 = removeClients(invalidCase1);
      const resultInvalid2 = removeClients(invalidCase2);
      const resultInvalid3 = removeClients(invalidCase3);
      const expectedOnInvalid1 = _CFG;
      const expectedOnInvalid2 = _CFG;
      const expectedOnInvalid3 = _CFG;
      expect(JSON.stringify(resultInvalid1)).toBe(expectedOnInvalid1);
      expect(JSON.stringify(resultInvalid2)).toBe(expectedOnInvalid2);
      expect(JSON.stringify(resultInvalid3)).toBe(expectedOnInvalid3);
    });
    test('returns the new configuration when source is valid', () => {
      const _CFG = { ...getConfig() };
      const params = { clientIds: [sourceClientId] };
      const result = removeClients(params);
      setConfig(result);
      const expectedOnValid1 = result;
      const expected = result.dataClients.some((c) => c.clientId === sourceClientId);
      expect(JSON.stringify(_CFG)).not.toBe(JSON.stringify(expectedOnValid1));
      expect(expected).toBe(false);
    });
    test('returns the new configuration when target is valid', () => {
      const _CFG = { ...getConfig() };
      const params = { clientIds: [targetClientId] };
      const result = removeClients(params);
      setConfig(result);
      const expectedOnValid1 = JSON.stringify(result);
      const expectedOnValid2 = result.dataClients.some((c) => c.clientId === targetClientId);
      expect(JSON.stringify(_CFG)).not.toBe(expectedOnValid1);
      expect(expectedOnValid2).toBe(false);
    });
    test('returns the saved configuration when mutiple ids are passed', () => {
      const _CFG = { ...getConfig() };
      const params = { clientIds: [sourceClientId, targetClientId] };
      const result = removeClients(params);
      setConfig(result);

      const expectedOnValid1 = JSON.stringify(result);
      const expectedOnValid2 = result.dataClients.some((c) => c.clientId === sourceClientId);
      const expectedOnValid3 = result.dataClients.some((c) => c.clientId === targetClientId);
      expect(JSON.stringify(_CFG)).not.toBe(expectedOnValid1);
      expect(expectedOnValid2).toBe(false);
      expect(expectedOnValid3).toBe(false);
    });
  });
});

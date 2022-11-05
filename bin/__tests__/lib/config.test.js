const {
  getClientIDs,
  getConfig,
  parseCLIConfig,
  readCLISettings,
  readConfigFile,
  setConfig,
} = require('../../lib/config');

describe('weaver config lib tests', () => {
  test('Base behavior', () => {
    expect(getClientIDs).not.toBe(undefined);
    expect(getConfig).not.toBe(undefined);
    expect(parseCLIConfig).not.toBe(undefined);
    expect(readCLISettings).not.toBe(undefined);
    expect(readConfigFile).not.toBe(undefined);
    expect(setConfig).not.toBe(undefined);
  });
});

require('@babel/polyfill');

const HOMEDIR = require('os').homedir();
const logging = require('debug')('Weaver:__tests__:cli');
const shell = require('shelljs');
const path = require('path');
const { DEFAULT_CONFIG_PATH } = require('../../lib/constants');
const {
  applyConfig,
  getJSONContent,
  isJSONFile,
  isValidConfigObject,
  pathExists,
  showConfig,
  validateConfig,
  validationFeedback,
} = require('../../options/config');

const MOCKS_DIR = path.resolve(__dirname, '../__mock__');


describe('weaver --config tests', () => {
  beforeAll(() => {
    logging('beforeAll');
  });

  test('Base behavior', () => {
    expect(() => shell.exec('weaver --config')).not.toThrow();
    expect(() => showConfig()).not.toThrow();
    expect(() => validationFeedback()).not.toThrow();
    expect(applyConfig()).toEqual(DEFAULT_CONFIG_PATH);
  });

  test('Input validation', () => {
    const invalid = `${HOMEDIR}/random/.weaver.json`;
    const valid = `${MOCKS_DIR}/.weaver.mock.json`;

    expect(pathExists(invalid)).toEqual(false);
    expect(getJSONContent(invalid)).toEqual(null);
    expect(isJSONFile(invalid)).toEqual(false);
    expect(validateConfig(invalid).valid).toEqual(false);
    expect(isValidConfigObject(invalid)).toEqual(false);

    expect(pathExists(valid)).toEqual(true);
    expect(getJSONContent(valid)).not.toEqual(null);
    expect(isJSONFile(valid)).toEqual(true);
    expect(validateConfig(valid).valid).toEqual(true);
    expect(isValidConfigObject(getJSONContent(valid))).toEqual(true);
  });

  test('Input assimilation', () => {
    const mockDir = `${MOCKS_DIR}/.weaver.mock.json`;
    expect(applyConfig(mockDir)).toEqual(mockDir);
  });
});

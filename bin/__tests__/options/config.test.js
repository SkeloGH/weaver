require('@babel/polyfill');

const HOMEDIR = require('os').homedir();
const logging = require('debug')('Weaver:__tests__:cli');
const shell = require('shelljs');
const { DEFAULT_CONFIG_PATH } = require('../../lib/constants');
const {
  applyConfig,
  pathExists,
  getJSONContent,
  isJSONFile,
  isValidConfigFile,
  isValidConfigObject,
} = require('../../options/config');

const MOCKS_DIR = `${__dirname}/../__mock__`;


describe('weaver --config tests', () => {
  beforeAll(() => {
    logging('beforeAll');
  });

  test('Base behavior', () => {
    expect(() => { shell.exec('weaver --config'); }).not.toThrow();
    expect(applyConfig).not.toThrow();
    expect(applyConfig()).toEqual(DEFAULT_CONFIG_PATH);
  });

  test('Input validation', () => {
    const invalid = `${HOMEDIR}/random/.weaver.json`;
    const valid = `${MOCKS_DIR}/.weaver.mock.json`;

    expect(pathExists(invalid)).toEqual(false);
    expect(getJSONContent(invalid)).toEqual(null);
    expect(isJSONFile(invalid)).toEqual(false);
    expect(isValidConfigFile(invalid)).toEqual(false);
    expect(isValidConfigObject(invalid)).toEqual(false);

    expect(pathExists(valid)).toEqual(true);
    expect(getJSONContent(valid)).not.toEqual(null);
    expect(isJSONFile(valid)).toEqual(true);
    expect(isValidConfigFile(valid)).toEqual(true);
    expect(isValidConfigObject(getJSONContent(valid))).toEqual(true);
  });

  test('Input assimilation', () => {
    const mockDir = `${MOCKS_DIR}/.weaver.mock.json`;
    expect(applyConfig(mockDir)).toEqual(mockDir);
  });
});

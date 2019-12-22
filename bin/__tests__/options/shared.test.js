const HOMEDIR = require('os').homedir();
const path = require('path');
const logging = require('debug')('Weaver:bin:__tests__:options:shared');
const {
  absPathname,
  getJSONContent,
} = require('../../options/shared');

const MOCKS_DIR = path.resolve(__dirname, '../__mock__');

describe('weaver argument parser tests', () => {
  beforeAll(() => {
    logging('beforeAll');
  });

  test('Base behavior', () => {
    const invalid = `${HOMEDIR}/random/.weaver.json`;
    const valid = `${MOCKS_DIR}/.weaver.mock.json`;
    expect(absPathname(process.env.PWD)).toEqual(process.env.PWD);
    expect(getJSONContent(invalid)).toEqual(null);
    expect(getJSONContent(valid)).not.toEqual(null);
  });
});

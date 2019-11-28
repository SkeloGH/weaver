require('@babel/polyfill');

const logging = require('debug')('Weaver:__tests__:cli');
const { parseOptions } = require('../../options/parse');


describe('weaver argument parser', () => {
  beforeAll(() => {
    logging('beforeAll');
  });

  test('Base behavior', () => {
    expect(() => parseOptions()).not.toThrow();
    expect(() => parseOptions({ config: '' })).not.toThrow();
    expect(() => parseOptions({ config: './' })).not.toThrow();
  });
});

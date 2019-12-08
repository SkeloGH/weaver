const logging = require('debug')('Weaver:bin:__tests__:options:parse');
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

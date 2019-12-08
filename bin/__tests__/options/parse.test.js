const logging = require('debug')('Weaver:bin:__tests__:options:parse');
const { parseOptions } = require('../../options/parse');


describe('weaver argument parser', () => {
  beforeAll(() => {
    logging('beforeAll');
  });

  test('Base behavior', () => {
    const invalidConfig1 = undefined;
    const invalidConfig2 = { config: '' };
    const invalidConfig3 = { config: './' };
    expect(() => parseOptions(invalidConfig1)).not.toThrow();
    expect(() => parseOptions(invalidConfig2)).not.toThrow();
    expect(() => parseOptions(invalidConfig3)).not.toThrow();
  });
});

const logging = require('debug')('Weaver:bin:__tests__:options:shared');
const {
  absPathname,
} = require('../../options/shared');


describe('weaver argument parser tests', () => {
  beforeAll(() => {
    logging('beforeAll');
  });

  test('Base behavior', () => {
    expect(absPathname(process.env.PWD)).toEqual(process.env.PWD);
  });
});

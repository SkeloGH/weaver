const util = require('../../lib/utils');

describe('weaver utils tests', () => {
  test('Base behavior', () => {
    expect(util).not.toBe(undefined);
  });
});

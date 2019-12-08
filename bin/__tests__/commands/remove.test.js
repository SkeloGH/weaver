const rm = require('../../commands/remove');

describe('weaver remove command tests', () => {
  test('Base behavior', () => {
    expect(rm).not.toBe(undefined);
  });
});

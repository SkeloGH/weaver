const idx = require('../../commands/index');

describe('weaver commands main tests', () => {
  test('Base behavior', () => {
    expect(idx).not.toBe(undefined);
  });
});

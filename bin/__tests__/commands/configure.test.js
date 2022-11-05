const cfg = require('../../commands/configure');

describe('weaver configure command tests', () => {
  test('Base behavior', () => {
    expect(cfg).not.toBe(undefined);
  });
});

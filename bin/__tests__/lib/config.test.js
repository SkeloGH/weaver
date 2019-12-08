const cfg = require('../../lib/config');

describe('weaver config lib tests', () => {
  test('Base behavior', () => {
    expect(cfg).not.toBe(undefined);
  });
});

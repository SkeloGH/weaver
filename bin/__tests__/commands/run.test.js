const run = require('../../commands/run');

describe('weaver run command tests', () => {
  test('Base behavior', () => {
    expect(run).not.toBe(undefined);
  });
});

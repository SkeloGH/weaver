const add = require('../../commands/add');

describe('weaver add command tests', () => {
  test('Base behavior', () => {
    expect(add).not.toBe(undefined);
  });
});

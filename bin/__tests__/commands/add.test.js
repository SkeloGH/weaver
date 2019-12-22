const importedModule = require('../../commands/add');

describe('weaver add command tests', () => {
  test('Base behavior', () => {
    expect(importedModule).not.toBe(undefined);
  });
  test('module export keys are covered', () => {
    const keys = [
      'name',
      'description',
      'setup',
      'parse',
    ];
    const filter = (k) => keys.indexOf(k) < 0;
    const keysMatch = Object.keys(importedModule).filter(filter);
    expect(keysMatch.length).toBe(0);
  });
});

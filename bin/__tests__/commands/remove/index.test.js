const importedModule = require('../../../commands/remove/index');

describe('weaver add command tests', () => {
  test('Base behavior', () => {
    expect(importedModule).not.toBe(undefined);
  });
  test('Client logic is exported', () => {
    expect(importedModule.client).not.toBe(undefined);
  });
});

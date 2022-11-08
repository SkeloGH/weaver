const run = require('../../commands/run');

describe('weaver run command tests', () => {
  test('Command has the expected properties', () => {
    expect(run).not.toBe(undefined);
    expect(run.name).not.toBe(undefined);
    expect(run.description).not.toBe(undefined);
    expect(run.setup).toBeInstanceOf(Function);
    expect(run.parse).toBeInstanceOf(Function);
  });

  test('Command parsing', () => {
    expect(run.parse({})).toMatchObject({});
  });
});

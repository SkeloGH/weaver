import Weaver from '../'
import * as CONFIG from '../config'

test('Public methods are defined', () => {
  const instance = new Weaver(CONFIG);
  expect(instance._configure).not.toBeUndefined();
  expect(instance.showResults).not.toBeUndefined();
  expect(instance.connectClients).not.toBeUndefined();
  expect(instance.run).not.toBeUndefined();
});
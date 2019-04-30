import Weaver from '../';
require("@babel/polyfill");

const mockClient = (type) => {
  return { config: { type }, connect() { return Promise.resolve('works') } }
};
const mockClients = [ mockClient('source'), mockClient('target') ];
const CONFIG = {
  queries: [],
  dataClients: [...mockClients],
  jsonConfig: {
    filePath: `${process.env.PWD}/results/weaver.test.json`
  }
};

test('Public methods are defined', () => {
  const weaver = new Weaver(CONFIG);
  expect(weaver.collect).not.toBeUndefined();
  expect(weaver.digest).not.toBeUndefined();
  expect(weaver._configure).not.toBeUndefined();
  expect(weaver.showResults).not.toBeUndefined();
  expect(weaver.connectClients).not.toBeUndefined();
  expect(weaver.run).not.toBeUndefined();
});

test('Self class configuration', () => {
  const weaver = new Weaver(CONFIG);
  expect(weaver.queries).not.toBeUndefined();
  expect(weaver.dataClients).not.toBeUndefined();
  expect(weaver.jsonConfig).not.toBeUndefined();
  expect(weaver.dataSources).not.toBeUndefined();
  expect(weaver.dataTargets).not.toBeUndefined();
});

test('"showResults" returns the same input', async () => {
  const weaver = new Weaver(CONFIG);
  const mockObj = { a: 'b', "c": "d" };
  const results = await weaver.showResults(mockObj);
  expect(results).toBe(mockObj)
});

test('"connectClients" calls the connect methods', async () => {
  const weaver = new Weaver(CONFIG);
  const client = { connect() { return Promise.resolve('works') } };
  const mockClients = [client];
  const results = await weaver.connectClients(mockClients);
  expect(results).toEqual(['works'])
});

test('"run" method proper execution', () => {
  // TODO: refactor method for testability
});
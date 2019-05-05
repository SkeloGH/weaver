require("@babel/polyfill");
import Weaver from '../';

const mongo = require('mongodb');
const ObjectId = mongo.ObjectID;
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
  expect(weaver.collect).toBeDefined();
  expect(weaver.digest).toBeDefined();
  expect(weaver._configure).toBeDefined();
  expect(weaver.showResults).toBeDefined();
  expect(weaver.connectClients).toBeDefined();
  expect(weaver.run).toBeDefined();
});

test('Self class configuration', () => {
  const weaver = new Weaver(CONFIG);
  expect(weaver.queries).toBeDefined();
  expect(weaver.dataClients).toBeDefined();
  expect(weaver.jsonConfig).toBeDefined();
  expect(weaver.dataSources).toBeDefined();
  expect(weaver.dataTargets).toBeDefined();
});

test('"showResults" returns the same input', async () => {
  const weaver = new Weaver(CONFIG);
  const mockObj = { a: 'b', "c": "d" };
  const results = await weaver.showResults(mockObj);
  expect(results).toBe(mockObj);
});

test('"connectClients" calls the connect methods', async () => {
  const weaver = new Weaver(CONFIG);
  const client = { connect() { return Promise.resolve('works') } };
  const mockClients = [client];
  const results = await weaver.connectClients(mockClients);
  expect(results).toEqual(['works']);
});

test('Weaver interwines', done => {
  /**
   * TODO: refactor method for testability
   * 1. Test clients connected successfully
   * 2. Test warm up query
   * 3. Test interlacing
   * 4. Test JSON output
  */
  function cb(result) {
    expect(result).toBeDefined();
    done();
  }
  const cfg = require('../config');
  const weaver = new Weaver(cfg);
  weaver.run(cb);
});
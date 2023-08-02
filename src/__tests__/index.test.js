const logging = require('debug');
const ldObject = require('lodash/object');

const {
  disconnect,
  initializeAndSeed,
  mockCart,
  mockOrder,
  mockUser,
} = require('./__setup__/mongodb');
// TODO: initialize and seed pg
const CONFIG = require('./config');
const Weaver = require('..');

const log = logging('Weaver:__tests__:root');
let targetClient1;

beforeAll(async () => {
  log('Initializing dataClients');
  [targetClient1] = CONFIG.dataClients;
  await initializeAndSeed();
});

afterAll(async () => {
  await disconnect();
});

describe('Weaver main test suite', () => {
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
    const mockObj = { a: 'b', c: 'd' };
    const results = await weaver.showResults(mockObj);
    expect(results).toBe(mockObj);
  });

  test('"connectClients" calls the connect methods', async () => {
    const weaver = new Weaver(CONFIG);
    const client = { connect() { return Promise.resolve('works'); } };
    const mockClients = [client];
    const results = await weaver.connectClients(mockClients);
    expect(results).toEqual(['works']);
    await weaver.disconnect();
  });

  test('Weaver interwines', async () => {
    const weaver = new Weaver(CONFIG);
    const opResult = await weaver.run();

    log('interwine opResult: ', opResult);

    expect(opResult).toBeDefined();
    expect(opResult).toBeDefined();
    expect(opResult[0]).toBeDefined();
    expect(opResult[0][0]).toBeDefined();
    expect(opResult[0][0].acknowledged).toBeDefined();
    expect(opResult[0][0].acknowledged).toEqual(true);
    expect(opResult[0][1].acknowledged).toBeDefined();
    expect(opResult[0][1].acknowledged).toEqual(true);
    expect(opResult[0][2].acknowledged).toBeDefined();
    expect(opResult[0][2].acknowledged).toEqual(true);

    const users = targetClient1.db.collection('users');
    const carts = targetClient1.db.collection('carts');
    const orders = targetClient1.db.collection('orders');
    const insertedUser = await users.findOne(mockUser);
    const insertedCart = await carts.findOne(mockCart);
    const insertedOrder = await orders.findOne(mockOrder);

    expect(ldObject.omit('_id', insertedUser)).toEqual(ldObject.omit('_id', mockUser));
    expect(ldObject.omit('_id', insertedCart)).toEqual(ldObject.omit('_id', mockCart));
    expect(ldObject.omit('_id', insertedOrder)).toEqual(ldObject.omit('_id', mockOrder));
    await weaver.disconnect();
  });
});

const logging = require('debug');
const ObjectId = require('bson-objectid');
const CONFIG = require('./config');
const Weaver = require('../');
const ldObject = require('lodash/object');

const log = logging('Weaver:__tests__:root');

describe('Weaver main test suite', () => {
  let sourceClient1;
  let targetClient1;

  const mockUser = { _id: ObjectId('abcdef78901234abcdef1234'), name: 'John', orders: [{ orderId: '4321fedcbafedcba67890123' }] };
  const mockCart = { _id: ObjectId('fedcba67890123fedcba4321'), userId: 'abcdef78901234abcdef1234' };
  const mockOrder = { _id: ObjectId('4321fedcbafedcba67890123'), cartId: 'fedcba67890123fedcba4321' };

  beforeAll(async () => {
    log('Initializing dataClients');
    [sourceClient1, targetClient1] = CONFIG.dataClients;

    await sourceClient1.connect();
    await targetClient1.connect();

    const users = sourceClient1.db.collection('users');
    const carts = sourceClient1.db.collection('carts');
    const orders = sourceClient1.db.collection('orders');

    await users.insertOne(mockUser);
    await carts.insertOne(mockCart);
    await orders.insertOne(mockOrder);

    /**
     * @note this call to _fetchCollections is needed to reload the collections
     * since it runs when `connect` is called above, right before loading the mocked
     * collections
     */
    const sourcecollections = await sourceClient1._fetchCollections();

    log('Mock data created', sourcecollections);

    const insertedUser = await users.findOne(mockUser);
    const insertedCart = await carts.findOne(mockCart);
    const insertedOrder = await orders.findOne(mockOrder);

    expect(ldObject.omit('_id', insertedUser)).toEqual(ldObject.omit('_id', mockUser));
    expect(ldObject.omit('_id', insertedCart)).toEqual(ldObject.omit('_id', mockCart));
    expect(ldObject.omit('_id', insertedOrder)).toEqual(ldObject.omit('_id', mockOrder));
    await sourceClient1.database.close();
    await targetClient1.database.close();
  });

  afterAll(async () => {
    [sourceClient1, targetClient1] = CONFIG.dataClients;
    await sourceClient1.disconnect();
    await targetClient1.disconnect();
  });

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
  });

  test('Weaver interwines', async (done) => {
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
  });
});

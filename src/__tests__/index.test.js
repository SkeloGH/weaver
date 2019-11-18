require('@babel/polyfill');

const logging = require('debug');
const { ObjectId } = require('mongodb');
const CONFIG = require('./config');
const Weaver = require('../');

const log = logging('Weaver:__tests__:root');

describe('insert', () => {
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

    expect(insertedUser).toEqual(mockUser);
    expect(insertedCart).toEqual(mockCart);
    expect(insertedOrder).toEqual(mockOrder);
  });

  afterAll(async () => {
    await sourceClient1.db.close();
    await sourceClient1.connection.close();
    await targetClient1.db.close();
    await targetClient1.connection.close();
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
    /**
     * TODO: refactor method for testability
     * 1. [x] Test clients connected successfully
     * 2. [x] Test warm up query
     * 3. [ ] Test interlacing
     * 4. [ ] Test JSON output
    */
    async function cb(opResult) {
      log('interwine opResult: ', opResult);
      expect(opResult).toBeDefined();
      expect(opResult[0]).toBeDefined();
      expect(opResult[0][0]).toBeDefined();
      expect(opResult[0][0].result).toEqual(expect.objectContaining({ ok: 1 }));

      const users = targetClient1.db.collection('users');
      const carts = targetClient1.db.collection('carts');
      const orders = targetClient1.db.collection('orders');
      const insertedUser = await users.findOne(mockUser);
      const insertedCart = await carts.findOne(mockCart);
      const insertedOrder = await orders.findOne(mockOrder);

      expect(insertedUser).toEqual(mockUser);
      expect(insertedCart).toEqual(mockCart);
      expect(insertedOrder).toEqual(mockOrder);
      done();
    }
    const weaver = new Weaver(CONFIG);
    weaver.run(cb);
  });
});

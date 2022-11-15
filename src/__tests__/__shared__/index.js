const logging = require('debug');
const ObjectId = require('bson-objectid');
const ldObject = require('lodash/object');

const CONFIG = require('../config');

const log = logging('Weaver:shared:__tests__');

let sourceClient1;
let targetClient1;

const mockUser = { _id: ObjectId('abcdef78901234abcdef1234'), name: 'John', orders: [{ orderId: '4321fedcbafedcba67890123' }] };
const mockCart = { _id: ObjectId('fedcba67890123fedcba4321'), userId: 'abcdef78901234abcdef1234' };
const mockOrder = { _id: ObjectId('4321fedcbafedcba67890123'), cartId: 'fedcba67890123fedcba4321' };

const initializeAndSeedMongoDB = async () => {
  log('Initializing dataClients');
  [sourceClient1, targetClient1] = CONFIG.dataClients;

  await sourceClient1.connect();
  await targetClient1.connect();

  const users = sourceClient1.db.collection('users');
  const carts = sourceClient1.db.collection('carts');
  const orders = sourceClient1.db.collection('orders');

  let insertedUser = await users.findOne(mockUser);
  let insertedCart = await carts.findOne(mockCart);
  let insertedOrder = await orders.findOne(mockOrder);

  if (!insertedUser) await users.insertOne(mockUser);
  if (!insertedCart) await carts.insertOne(mockCart);
  if (!insertedOrder) await orders.insertOne(mockOrder);

  /**
     * @note this call to _fetchCollections is needed to reload the collections
     * since it runs when `connect` is called above, right before loading the mocked
     * collections
     */
  const sourcecollections = await sourceClient1._fetchCollections();

  log('Mock data created', sourcecollections);

  insertedUser = await users.findOne(mockUser);
  insertedCart = await carts.findOne(mockCart);
  insertedOrder = await orders.findOne(mockOrder);

  await sourceClient1.database.close();
  await targetClient1.database.close();
};

const disconnectMongoDB = async () => {
  [sourceClient1, targetClient1] = CONFIG.dataClients;
  await sourceClient1.disconnect();
  await targetClient1.disconnect();
};

module.exports = {
  disconnectMongoDB,
  initializeAndSeedMongoDB,
  mockCart,
  mockOrder,
  mockUser,
  sourceClient1,
  targetClient1,
};

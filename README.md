![Entity-relationship graph](https://github.com/SkeloGH/weaver/raw/develop/images/athenian-weaver.png?raw=true)


# Weaver

Migrate related document objects within and across different databases.

[![codebeat badge](https://codebeat.co/badges/d6101e2d-7c26-4c19-a820-d90a96a5fd54)](https://codebeat.co/projects/github-com-skelogh-weaver-master) [![Reviewed by Hound](https://img.shields.io/badge/Reviewed_by-Hound-8E64B0.svg)](https://houndci.com) [![Coverage Status](https://coveralls.io/repos/github/SkeloGH/weaver/badge.svg)](https://coveralls.io/github/SkeloGH/weaver) [![CircleCI](https://circleci.com/gh/SkeloGH/weaver.svg?style=svg)](https://circleci.com/gh/SkeloGH/weaver)

# Context

- [Entity-relationship model](https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model)
- [Extended reference pattern](https://www.mongodb.com/blog/post/building-with-patterns-the-extended-reference-pattern)

Often times when working with NRDBs like MongoDB, documents reference to other documents from different collections (or even DBs). This becomes a challenge when trying to replicate an interwined dataset to be used in a different environment.

For example, a database has the following collections/documents:

```javascript
  // db.users.findOne({_id: ObjectId('abcdef78901234abcdef1234')})
  {
    _id: ObjectId('abcdef78901234abcdef1234'),
    name: 'John',
    orders: [ { orderId: '4321fedcbafedcba67890123' } ]
  }

  // db.orders.findOne({_id: ObjectId('4321fedcbafedcba67890123')})
  {
    _id: ObjectId('4321fedcbafedcba67890123'),
    cartId: 'fedcba67890123fedcba4321'
  }

  // db.carts.findOne({_id: ObjectId('fedcba67890123fedcba4321')})
  {
    _id: ObjectId('fedcba67890123fedcba4321'),
    userId: 'abcdef78901234abcdef1234'
  }
```

Note how `user` relates to `order`, and `order` relates to `cart`.

If you wanted to migrate the `orders` and `carts` associated to the `user` to your local environment, you'd need to:

1. Go to the `[users|orders|carts] collection` and find the document.
2. Check if any of the fields is a reference to another collection.
3. Copy the reference value.
4. Repeat from step 1.

This tool finds the relationships, and migrates them to a destination db:

| Query                                                    | source db   | target db   |
| -------------------------------------------------------- | ----------- | ----------- |
| `db.users.findOne(ObjectId('abcdef78901234abcdef1234'))` |      1      |      1      |
| `db.orders.findOne(ObjectId('4321fedcbafedcba67890123'))`|      1      |      1      |
| `db.carts.findOne(ObjectId('fedcba67890123fedcba4321'))` |      1      |      1      |

It can also plot the entity-relationship graph (coming soon).

![Entity-relationship graph](https://github.com/SkeloGH/weaver/raw/develop/images/example_graph.png?raw=true)

# Usage

# Requirements

- [nvm 0.33](https://github.com/creationix/nvm/tree/v0.33.11).
- [node v10.8.0](https://nodejs.org/dist/v10.8.0/).
- [npm 6.4.1](https://www.npmjs.com/package/npm/v/6.4.1).

## Getting started

- `git clone https://github.com/SkeloGH/weaver.git`.
- `cd ./weaver`
- `nvm use`.
- `npm install`.
- `npm test`.
- Configure according to your settings (see below).
- `npm run app` (or `npm run dev` if you want to see the full logging).

### Add data sources and targets

There are 3 main files to look at:

1. `src/config/clients.js`: This is where you create instances of the db `source` & `target` clients to be queried and replicated onto. For every `source` client there should be a matching `target` client. You'll see 2 instances of `WeaverMongoClient`, which is just a wrapper of `mongodb.MongoClient`:

```javascript
module.exports = [
  // This is the client that has your source data, where you want to run the queries against.
  new WeaverMongoClient({
    type: 'source',  // The type of db client
    db: {

      //    The source db url address, in this case using port forwarding
      url: 'mongodb://localhost:27020/my-app-store-prod',

      //    The source db name
      name: 'my-app-store-prod',

      //    node-mongodb-native options
      options: {}
    },
    client: {
      // The collection names to skip querying
      ignoreFields: ['passwords']
    }
  }),

  // This is the collection where you want to copy the data to.
  new WeaverMongoClient({
    type: 'target',
    origin: 'my-app-store-prod', // IMPORTANT The name of the db you'll be pulling from ^
    db: {
      url: 'mongodb://localhost:27017/my-app-store-local', // Local db
      name: 'my-app-store-local',
      options: {}
    }
  }),
];
```

2. `src/config/index.js`: This is where you'll be changing things around more often, here you need to set the initial query that Weaver will use as a seed to start looking up for references:

```javascript
const dataClients = require('./clients'); // Modified in step 1

// The main app configuration.
module.exports = {

  // These are the seed queries, it will lookup the documents in every data source
  // and read their fields to look up for related documents between data clients
  queries: [
    { _id: ObjectId('abcdef78901234abcdef1234') }, // < this is the `user` id in the README example
  ],

  dataClients,
  jsonConfig: {
    // Here you define where the JSON output should be saved to:
    filePath: '${process.env.PWD}/results/weaver.out.json' // < this one is checked into the repo, give it a look.
  }
};
```

### Run the app

`npm run app`

### See the results

Once the replication is complete, the results will be present in the `target` client(s). Additionally, the operation results will be printed to a JSON file. Each key is the document's `_id` and the content is a summary of the document found and where it was found, for our example:

```json
{
  "abcdef78901234abcdef1234": {
    "database": "my-app-store-prod",
    "dataSet": "users",
    "data": {
      "_id": "abcdef78901234abcdef1234",
      "name": "John",
      "orders": [
        {
          "orderId": "4321fedcbafedcba67890123"
        }
      ]
    }
  },
  "4321fedcbafedcba67890123": {
    "database": "my-app-store-prod",
    "dataSet": "orders",
    "data": {
      "_id": "4321fedcbafedcba67890123",
      "cartId": "fedcba67890123fedcba4321"
    }
  },
  "fedcba67890123fedcba4321": {
    "database": "my-app-store-prod",
    "dataSet": "carts",
    "data": {
      "_id": "fedcba67890123fedcba4321",
      "userId": "abcdef78901234abcdef1234"
    }
  }
}
```

You can try out all of the abobe running `npm run test`, check out the `__tests__` folder to see the details.

# Roadmap

- [WIP] `weaver` CLI [(follow the issue)](https://github.com/SkeloGH/weaver/projects/2)
- Add plugins for different data sources.
  + ~~MongoDB~~
  + ElasticSearch
  + DinamoDB
  + Cassandra
  + and so on...
- API/SDK (?)
- Client UI
- Connect via SSH.
- Doc pages

[See what's been worked on](https://github.com/SkeloGH/weaver/projects).
Questions? [create an issue!](https://github.com/SkeloGH/weaver/issues).


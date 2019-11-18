# Weaver

A tool for mapping, visualizing and importing relational-data in NRDBs

[![codebeat badge](https://codebeat.co/badges/d6101e2d-7c26-4c19-a820-d90a96a5fd54)](https://codebeat.co/projects/github-com-skelogh-weaver-master) [![Reviewed by Hound](https://img.shields.io/badge/Reviewed_by-Hound-8E64B0.svg)](https://houndci.com) [![Coverage Status](https://coveralls.io/repos/github/SkeloGH/weaver/badge.svg)](https://coveralls.io/github/SkeloGH/weaver) [![CircleCI](https://circleci.com/gh/SkeloGH/weaver.svg?style=svg)](https://circleci.com/gh/SkeloGH/weaver)

# Context

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

If you wanted to replicate the `orders` and `carts` associated to the `user` in your local environment, for example, you need to:

1. Go to the `[users|orders|carts] collection` and find the document.
2. Check if any of the fields is a reference to another collection.
3. Copy the reference value.
4. Repeat from step 1.

OR! You could use this tool instead to find all the relationships, replicate them in your local db.

| Query                                                   | prod db     | local db  |
| ------------------------------------------------------- | ----------- | --------- |
| db.users.findOne(ObjectId('abcdef78901234abcdef1234'))  |    found 1  |  found 1  |
| db.orders.findOne(ObjectId('4321fedcbafedcba67890123')) |    found 1  |  found 1  |
| db.carts.findOne(ObjectId('fedcba67890123fedcba4321'))  |    found 1  |  found 1  |

Or even visualize them automatically (coming soon).

![Basic visualization of collection relationships](/images/example_graph.png?raw=true)

# Usage

## Getting started

- `git clone https://github.com/SkeloGH/weaver.git`.
- `cd ./weaver`
- `nvm use`.
- `npm install`.
- Configure according to your settings (see below).
- `npm run app`.

## Settings

> Note: the project structure needs refactoring as it's still on POC stage, for now `cd` into `approach_004-schemaless/` to try this out, but feel encouraged to explore the rest of the project!.

There are 3 main files to look at:

1. `config/clients.js`: This is where you create instances of the db clients to be queried/replicated onto, you'll see 2 instances of `WeaverMongoClient`, which is just a wrapper around `mongodb.MongoClient`:

```javascript
module.exports = [
  // This is the collection that has your source data, where you want to query against.
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
    origin: 'my-app-store-prod', // IMPORTANT The name of the db you'll be pulling from
    db: {
      url: 'mongodb://localhost:27017/my-app-store-local', // Local db
      name: 'my-app-store-local',
      options: {}
    }
  }),
];
```

2. `config/index.js`: This is where you'll be changing things around more often, here you need to set the initial query that Weaver will fetch and start looking up from:

```javascript
const dataClients = require('./clients');

// The main app configuration.
module.exports = {

  // These are the trigger queries, it will find the document in `users` collection
  // and use its field values to lookup against related documents across collections
  queries: [
    { _id: ObjectId('abcdef78901234abcdef1234') }, // < this is the `user` id in the example
  ],

  dataClients: dataClients,
  jsonConfig: {
    // Here you define where the JSON output should be saved to:
    filePath: '${process.env.PWD}/results/weaver.out.json' < this one is checked into the repo, give it a look.
  }
};
```

Once the replication is complete, the results will be also printed to a JSON file. Each key is the document's `_id` and the content is a summary of the document found and where it was found:

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

## MVP

- ~~Ability to map the schemas.~~
- ~~Ability to render a dendogram visualizer.~~
- ~~Ability to render a graph vizualizer.~~
- ~~Ability to find between collections.~~
- ~~Ability to install the retrieved collection data locally.~~
- ~~Ability to find between dbs.~~

## Foundations

- ~~In-code documentation.~~
- ~~Initial test coverage.~~
- Cleanup, refactor and definitive project structure. [Current WIP]

## Future

- Full test coverage.
- Add plugins for different data sources.
  + ~~MongoDB~~
  + ElasticSearch
  + DinamoDB
  + Cassandra
  + and so on...
- API/SDK

## Nice to have

- Client UI
- Output truth validation.
- Ability to find/install in remote DBs.
- Doc pages

[See what's been worked on](https://github.com/SkeloGH/weaver/projects)


# Requirements

- [node v10.8.0](https://nodejs.org/dist/v10.8.0/).
- [npm 6.4.1](https://www.npmjs.com/package/npm/v/6.4.1).
- [nvm 0.33](https://github.com/creationix/nvm/tree/v0.33.11).

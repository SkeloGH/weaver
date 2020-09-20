![Athenian weaver](https://github.com/SkeloGH/weaver/raw/develop/images/athenian-weaver.png?raw=true)


# Weaver

Migrate related document objects within and across different databases.

[NPM package: @skelogh/weaver](https://www.npmjs.com/package/@skelogh/weaver)

[![NodeJS 10](https://img.shields.io/badge/node-0.10.x-brightgreen.svg)](https://nodejs.org/en/blog/release/v10.0.0/) [![npm version](https://badge.fury.io/js/%40skelogh%2Fweaver.svg)](https://badge.fury.io/js/%40skelogh%2Fweaver) [![codebeat badge](https://codebeat.co/badges/d6101e2d-7c26-4c19-a820-d90a96a5fd54)](https://codebeat.co/projects/github-com-skelogh-weaver-master) [![Reviewed by Hound](https://img.shields.io/badge/Reviewed_by-Hound-8E64B0.svg)](https://houndci.com) [![Coverage Status](https://coveralls.io/repos/github/SkeloGH/weaver/badge.svg?branch=develop)](https://coveralls.io/github/SkeloGH/weaver?branch=develop) [![CircleCI](https://circleci.com/gh/SkeloGH/weaver.svg?style=svg)](https://circleci.com/gh/SkeloGH/weaver)

# Context

- [Entity-relationship model](https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model)
- [Extended reference pattern](https://www.mongodb.com/blog/post/building-with-patterns-the-extended-reference-pattern)

Often times when working with NRDBs like MongoDB, documents reference to other documents from different collections (or even DBs). This becomes a challenge when trying to replicate an interwined dataset to be used in a different environment.

![Weaver overview diagram](https://github.com/SkeloGH/weaver/raw/develop/doc/img/overview.png?raw=true)

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

# Getting started

Weaver runs on NodeJS >= 10

## Install via npm

`npm i -g @skelogh/weaver`

## How to test the CLI in dev mode

### Install the CLI tool

- After cloning the repo and installing dependencies, run `npm run build`.
- Run `npm pack` on the project root.
- A file `weaver-<VERSION>.tgz` will be created.
- Run `npm install -g weaver-<VERSION>.tgz`, it will install the package globally.

## Using the CLI tool

- After installing, just issue the `weaver` command, the CLI help will display the CLI help:

```
Usage: weaver [OPTIONS] COMMAND [ARG...]
       weaver [ --help | -v | --version ]

Commands:
  weaver run        Runs the app with the loaded configuration
  weaver add        Creation of client, query or ignore
  weaver remove     Removal of clients, queries or ignores

Options:
  --version, -v    Print version information and quit
  --config, -c     Read or set path of config file, default: undefined
  --dry            Run but don't save
  --info           Displays the current settings
  --json           Write the output in the configured JSON file
  --json-file      The JSON filepath where output will be streamed to
  --limit          The max amount of docs to retrieve
  --queries, --qq  Document ids to get relationships from, e.g.: 2a3b4c5d6e7f8g9h2a3b4c5d e7f8g9h2a3b4c5d2a3b4c5d6
  --verbose, -V    Enable highest level of logging, same as DEBUG=*
  --help           Show help
```

### 1. Add clients

In the CLI, run `weaver add client`, the following help will display:

```
Usage: weaver add client -fntou --options.<option_name>

  -f [mongodb]          <String> The client db family, mongodb is only supported for now.
  -n <name>             <String> The client db name.
  -t [source|target]    <String> source if the data will be pulled from it, target otherwise.
  -o [<source.name>]    <String> The target's origin db where the data will be copied from.
  -u <url>              <String> The client db URL.
  --options.<opt_name>  <Any> Client db-specific options, for now MongoClient options, use dot notation to set each option
                        Example: --options.readPreference secondaryPreferred
```

To pull data from a db into another, you'll need to add both the `source` and `target` clients. The `source` is where the document we want is stored, and `target` is where you want to copy to.

Example:

Assume the following remote server settings for `source`:
- Family: mongodb
- Type: source
- IP: 172.17.0.4
- Port: 27017
- Database name: production

```
weaver add client -f mongodb -n production -t source -u mongodb://172.17.0.4:27017
```

Assume the following local server settings for `target`:
- Family: mongodb
- Type: target
- IP: 127.0.0.1
- Port: 27017
- Database name: development
- Origin: production (This is used to map where the data will be pulled from, useful when dealing with multiple `source` and `target` databases.)

```
weaver add client -f mongodb -n development -t target -o production -u mongodb://127.0.0.1:27017
```


### 2. Find the document to clone

From the `source` database, find the document you want to copy to the `target` database and copy the stringified `_id`:

```
// Assume the following mongodb document in the `production` database, `pets` collection:
{
    _id: ObjectId("507f1f77bcf86cd799439011"),
    name: "fluffy"
}
```

### 3. Clone the document(s)

Once steps 1 & 2 are done, just run the following command:

```
weaver run --queries 507f1f77bcf86cd799439011
```



### 4. See the results

If all is setup correctly, you should now have a copy of the document in your `target` database, it will create the collection even if it didn't exist before:

```
> mongodb
mongodb> use development
mongodb> db.pets.find(ObjectId("507f1f77bcf86cd799439011"))

{
    _id: ObjectId("507f1f77bcf86cd799439011"),
    name: "fluffy"
}

>
```



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


# Weaver

An NRDBS relational-collection-field mapping, visualizing and importing tool

[![codebeat badge](https://codebeat.co/badges/d6101e2d-7c26-4c19-a820-d90a96a5fd54)](https://codebeat.co/projects/github-com-skelogh-weaver-master) [![Reviewed by Hound](https://img.shields.io/badge/Reviewed_by-Hound-8E64B0.svg)](https://houndci.com) [![Coverage Status](https://coveralls.io/repos/github/SkeloGH/weaver/badge.svg)](https://coveralls.io/github/SkeloGH/weaver) [![CircleCI](https://circleci.com/gh/SkeloGH/weaver.svg?style=svg)](https://circleci.com/gh/SkeloGH/weaver)

# Say what?

Often times documents have references to other documents or collections, which result in complex-to-replicate data sets while trying to retrieve every data entry with its connections. Not to mention documents interlaced between databases.

Here's an example. let's say you have these mongodb collections, represented as schemas

```
  Cart
  {
    _id: ObjectId,
    userId: ObjectId
  }

  User
  {
    _id: ObjectId,
    orders: [
      {
        orderId: ObjectId
      }
    ]
  }

  Order
  {
    _id: ObjectId,
    cartId: ObjectId
  }
```

If you wanted to manually retrieve all the User's related data, you'd need to:

- Go to the given collection and find the desired document.
- Check if any of the fields is a reference to another collection.
- Copy the reference value.
- Go over the referenced collection.
- Repeat from step 1.

This tool instead will help you download the relationships, and even visualize them automatically:

![Basic visualization of collection relationships](/images/example_graph.png?raw=true)

# Usage

## Getting started

- `git clone https://github.com/SkeloGH/weaver.git`.
- `npm install`.
- `nvm use`.
- Configure according to your settings (see below).
- `npm run app`.

## Settings

There are 3 main files to look at:

- `config/index.js`: This is where you'll be changing things around more often, here you can set the initial query for Weaver to start from, there are a couple of examples of our own so feel free to modify accordingly. [TODO - add documentation link]
- `config/clients.js`: This is where you create instances of the db clients to be queried/targeted, use the examples in there to set up your own clients. [TODO - add documentation link]
- `config/secret.example.js`: This is where your secret configurations should go, *BUT DON'T FORGET TO RENAME AS* `config/secret.out.js`, *SO THAT IS NOT PUSHED TO VERSION CONTROL*, use at your own risk. [TODO - add documentation link]

# Roadmap

- ~~Ability to map the schemas.~~
- ~~Ability to render a dendogram visualizer.~~
- ~~Ability to render a graph vizualizer.~~
- ~~Ability to find between collections.~~
- ~~Ability to install the retrieved collection data locally.~~
- ~~Ability to find between dbs.~~
- [Current WIP] Ability to find/install in remote dbs.
- Modularization.
- Parameterize scripts.
- Documentation.
- Cleanup, refactor and proper project structure
- Output truth validation.
- Full test coverage.
- Make it an npm package.
- Add plugins for different data sources.
  + Elasticsearch
  + DinamoDB
  + and so on...

# Requirements

- [node v10.8.0](https://nodejs.org/dist/v10.8.0/).
- [npm 6.4.1](https://www.npmjs.com/package/npm/v/6.4.1).
- [nvm 0.33](https://github.com/creationix/nvm/tree/v0.33.11).

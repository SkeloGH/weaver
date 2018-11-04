# Weaver

A MongoDB relational collection field mapping, visualizing and importing tool

[![codebeat badge](https://codebeat.co/badges/d6101e2d-7c26-4c19-a820-d90a96a5fd54)](https://codebeat.co/projects/github-com-skelogh-weaver-master) [![Reviewed by Hound](https://img.shields.io/badge/Reviewed_by-Hound-8E64B0.svg)](https://houndci.com) [![Coverage Status](https://coveralls.io/repos/github/SkeloGH/weaver/badge.svg)](https://coveralls.io/github/SkeloGH/weaver) [![CircleCI](https://circleci.com/gh/SkeloGH/weaver.svg?style=svg)](https://circleci.com/gh/SkeloGH/weaver)

# Say what

Often times documents have references to other documents or collections, which result in complex-to-replicate data sets that result in wasted time while trying to retrieve every data entry with its connections.

To name an example. let's say you have these mongodb collections, represented as schemas

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

If you wanted to manually retrieve a User's related data, you'd need to:

- Go over the collection and find the desired document
- Check if any of the fields is reference to another collection
- Copy the reference value
- Go over the referenced collection
- Repeat from step 1

This tool instead will help you visualize the relationships, and even download them automatically:

![Basic visualization of collection relationships](/images/example_graph.png?raw=true)

# Usage

[WIP]

# Roadmap

- Ability to map the schemas.
- Ability to render a dendogram visualizer.
- Ability to render a graph vizualizer.
- Ability to find between collections.
- [Current WIP] Ability to install the retrieved collection data locally.
- Output truth validation.
- Full test coverage.
- Modularization.
- Parameterize scripts.
- Cleanup, refactor and proper project structure and documentation.
- Make it an npm package.

# Requirements

- A directory where your schemas are saved
- As of now, works with [mongoose](https://mongoosejs.com/docs/guide.html) schemas

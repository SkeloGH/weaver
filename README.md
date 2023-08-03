![Athenian weaver](https://github.com/SkeloGH/weaver/raw/develop/images/athenian-weaver.png?raw=true)


# Weaver

Weaver: Clone n-ary relationship sets across distinct databases.

[NPM package: @skelogh/weaver](https://www.npmjs.com/package/@skelogh/weaver)

[![NodeJS 10](https://img.shields.io/badge/node-0.10.x-brightgreen.svg)](https://nodejs.org/en/blog/release/v10.0.0/) [![npm version](https://badge.fury.io/js/%40skelogh%2Fweaver.svg)](https://badge.fury.io/js/%40skelogh%2Fweaver) [![codebeat badge](https://codebeat.co/badges/d6101e2d-7c26-4c19-a820-d90a96a5fd54)](https://codebeat.co/projects/github-com-skelogh-weaver-master) [![Reviewed by Hound](https://img.shields.io/badge/Reviewed_by-Hound-8E64B0.svg)](https://houndci.com) [![Coverage Status](https://coveralls.io/repos/github/SkeloGH/weaver/badge.svg?branch=develop)](https://coveralls.io/github/SkeloGH/weaver?branch=develop) [![CircleCI](https://circleci.com/gh/SkeloGH/weaver.svg?style=svg)](https://circleci.com/gh/SkeloGH/weaver)

## Description

Weaver is a tool to help clone database documents and their n-ary relationships across databases. It automates fetching related documents based on references and copies them to a target database.

Key features:

- Configurable source queries to start from a base set of documents
- Supports multiple source and target databases, and database types via plugins
- Copies related documents by following reference fields
- Generates entity relationship diagrams to visualize the schema
- CLI and JavaScript library usage

![Weaver overview diagram](https://github.com/SkeloGH/weaver/raw/develop/doc/img/overview.png?raw=true)

## Usage

To use Weaver:

1. Install with `npm install @skelogh/weaver` 
2. Configure source and target databases in `config/clients.js`
3. Set source queries in `config/index.js`
4. Run `weaver run`

Output will be saved to the configured JSON file.

See [Examples](./EXAMPLES) for more usage details.

- [Entity-relationship model](https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model)
- [Extended reference pattern](https://www.mongodb.com/blog/post/building-with-patterns-the-extended-reference-pattern)



# Requirements

- [nvm >= 0.33](https://github.com/creationix/nvm/tree/v0.33.11).
- [node >= 16.18.0](https://nodejs.org/dist/v16.18.0/).
- [npm >= 6.4.1](https://www.npmjs.com/package/npm/v/6.4.1).



# Roadmap

[See what's been worked on](https://github.com/SkeloGH/weaver/projects).

Questions? [create an issue!](https://github.com/SkeloGH/weaver/issues).

## License

[MIT](./LICENSE)

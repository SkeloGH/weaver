/* eslint-disable max-len */
process.env.MONGOMS_DOWNLOAD_MIRROR = "https://fastdl.mongodb.org";
module.exports = {
  mongodbMemoryServerOptions: {
    instance: {
      // port?: ?number, // by default choose any free port
      // ip?: string, // by default '127.0.0.1', for binding to all IP addresses set it to `::,0.0.0.0`,
      // dbName?: string, // by default generate random dbName
      dbName: 'weaver--jest',
      // dbPath?: string, // by default create in temp directory
      // storageEngine?: string, // by default `ephemeralForTest`, available engines: [ 'devnull', 'ephemeralForTest', 'mmapv1', 'wiredTiger' ]
      debug: process.env.MONGOMS_DEBUG !== undefined, // by default false
      // replSet?: string, // by default no replica set, replica set name
      // auth?: boolean, // by default `mongod` is started with '--noauth', start `mongod` with '--auth'
      // args?: string[], // by default no additional arguments, any additional command line arguments for `mongod` `mongod` (ex. ['--notablescan'])
    },
    binary: {
      // version?: string, // by default 'latest'
      version: '4.4.17',
      // downloadDir?: string, // by default node_modules/.cache/mongodb-memory-server/mongodb-binaries
      // platform?: string, // by default os.platform()
      // arch?: string, // by default os.arch()
      debug: process.env.MONGOMS_DEBUG !== undefined, // by default false
      // checkMD5?: boolean, // by default false OR process.env.MONGOMS_MD5_CHECK
      skipMD5: true,
      // systemBinary?: string, // by default undefined or process.env.MONGOMS_SYSTEM_BINARY
    },
    // autoStart?: boolean, // by default true
    autoStart: false,
    debug: process.env.MONGOMS_DEBUG !== undefined,
  },
  // useSharedDBForAllJestWorkers: false, // use separate database for each jest worker
  // instance: {}, // use dynamic database name
};

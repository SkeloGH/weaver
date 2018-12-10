const fs = require('fs');
/**
 * Preferably, add the .out extension to the ignoreFields file to avoid committing into source control.
 * */
const ignoreFields = require('./ignoreFields');
/**
Example secret config file
*/
module.exports = {
  local: {
    db: {
      url: 'mongodb://localhost:27017',
      options: {},
      sources: [
        { name: 'local-animals-db' },
        { name: 'local-shelters-db' }
      ],
    },
    client: {
      ignoreFields: ignoreFields
    }
  },
  // ssh: {
  //   port: 22,
  //   private_key: fs.readFileSync('/Users/john_doe/.ssh/id_rsa'),
  //   agent: process.env.SSH_AUTH_SOCK,
  //   username: process.env.USER,
  // },
  // remote: {
  //   db: {
  //     url: 'mongodb://localhost:27017',
  //     sources: [
  //       { name: 'production-animals-db' },
  //       { name: 'production-shelters-db' }
  //     ],
  //   },
  //   client: {
  //     ignoreFields: ['donations', 'passwords']
  //   },
  //   host: 'production.hostname.com',
  //   dstPort: 27017,
  //   localPort: 27017,
  //   localhost: '127.0.0.1',
  // }
};
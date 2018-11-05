const fs = require('fs');
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
    }
  },
  ssh: {
    port: 22,
    private_key: fs.readFileSync('/Users/john_doe/.ssh/id_rsa'),
    agent: process.env.SSH_AUTH_SOCK,
    username: process.env.USER,
  },
  remote: {
    db: {
      url: 'mongodb://localhost:27017',
      sources: [
        { name: 'production-animals-db' },
        { name: 'production-shelters-db' }
      ],
    },
    client: {
      ignoreFields: ['donations', 'passwords']
    },
    host: 'production.hostname.com',
    dstPort: 27017,
    localPort: 27017,
    localhost: '127.0.0.1',
  }
};
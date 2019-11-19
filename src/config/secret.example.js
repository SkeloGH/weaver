/**
 * Preferably, add the .out extension to the ignoreFields file to avoid committing
 * into source control.
 * */
const ignoreFields = require('./ignoreFields');
/**
Example secret config file, customized for convenience.
*/
module.exports = {
  local: {
    db: {
      url: 'mongodb://localhost:27017',
      options: {},
      sources: [
        { name: 'local-animals-db' },
        { name: 'local-shelters-db' },
      ],
    },
    client: {
      ignoreFields,
    },
  },
};

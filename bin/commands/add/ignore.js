const ldColl = require('lodash/collection');
const ldObject = require('lodash/object');
const ldArray = require('lodash/array');
const shell = require('shelljs');
const logging = require('debug')('Weaver:bin:commands:add:ignore');
const { getConfig, setConfig, getClientIDs } = require('../../lib/config');

const clientIDs = getClientIDs();
let defaultMsg = 'No clients are configured yet, try adding a client first.';
if (clientIDs.length) {
  defaultMsg = `
  Usage
    weaver add ignore -i [clientID] -ns [<namespace> ...]

  Available clientIDs: ${clientIDs.join(' ')}
  `;
}
const commandName = 'ignore';
const commandDesc = 'Add a collection/index namespace to ignore when performing queries';
const commandSpec = (yargs) => {
  shell.echo(defaultMsg);
  return yargs
    .options({
      clientid: {
        alias: 'i',
        choices: clientIDs,
        demandOption: true,
        describe: 'The client id that will skip reading from the provided namespace.',
        type: 'string',
      },
      namespace: {
        alias: 'n',
        demandOption: true,
        describe: 'The namespaces to avoid querying upon.',
        type: 'array',
      },
    });
};

const addIgnores = (params = {}) => {
  const CFG = { ...getConfig() };
  const dataClient = ldColl.find(CFG.dataClients, (c) => c.clientId === params.clientid);
  const clientIdx = ldArray.findIndex(CFG.dataClients, (c) => c.clientId === params.clientid);
  const newClient = ldObject.assign({}, dataClient);
  const clientOpts = newClient.client ? newClient.client : {};
  let { ignoreFields = [] } = clientOpts;

  ignoreFields = ignoreFields.concat(params.namespace);
  clientOpts.ignoreFields = ldArray.uniq(ignoreFields);
  newClient.client = ldObject.assign({}, clientOpts);
  CFG.dataClients[clientIdx] = newClient;

  return CFG;
};

const commandHandler = (params) => {
  logging('ignorefield params', params);
  const newClientConfig = addIgnores(params);
  if (newClientConfig) {
    try {
      logging('Saving ignoreFields');
      setConfig(newClientConfig);
      shell.echo('Saved new settings:', JSON.stringify(newClientConfig, null, 2));
    } catch (error) {
      shell.echo(error);
      return false;
    }
  }
  return params;
};

module.exports = {
  commandName,
  commandDesc,
  commandSpec,
  commandHandler,
};

const shell = require('shelljs');
const logging = require('debug')('Weaver:bin:commands:add:client');
const { getConfig, setConfig, getClientIDs } = require('../../lib/config');

const clientIdString = getClientIDs().join(' ');
const defaultMsg = `Usage
  weaver remove client -i ${clientIdString}
`;
const commandName = 'client';
const commandDesc = 'Interactive removal of one or more existing clients';

const removeClients = (params = {}) => {
  const CFG = { ...getConfig() };
  const { dataClients } = CFG;
  if (params && params.clientIds) {
    const clientIds = params.clientIds.map((i) => i.toString());
    CFG.dataClients = dataClients.filter((c) => clientIds.indexOf(c.clientId) < 0);
  }
  return CFG;
};

const commandSpec = (yargs) => {
  shell.echo(defaultMsg);
  return yargs.options({
    i: {
      alias: 'clientIds',
      demandOption: true,
      describe: 'The clientIds to remove.',
      type: 'array',
    },
  });
};

const commandHandler = (params) => {
  logging('client params', params);
  const newClientConfig = removeClients(params);
  if (newClientConfig) {
    try {
      logging('Removing client with clientId');
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
  commandDesc,
  commandHandler,
  commandName,
  commandSpec,
  removeClients,
};

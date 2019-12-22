const shell = require('shelljs');
const logging = require('debug')('Weaver:bin:commands:add:client');
const { getConfig, setConfig } = require('../../lib/config');

const getClientIDs = () => {
  const CFG = { ...getConfig() };
  return CFG.dataClients.map((c) => c.clientId);
};
const clientIdString = getClientIDs().join(' ');
const defaultMsg = `Usage
  weaver remove client -i ${clientIdString}
`;
const commandName = 'client';
const commandDesc = 'Interactive removal of one or more existing clients';


const removeClient = (params = {}) => {
  const newSettings = { ...getConfig() };
  const { dataClients } = newSettings;
  newSettings.dataClients = dataClients.filter((c) => params.clientIds.indexOf(c.clientId) > -1);
  return newSettings;
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
  const newClientConfig = removeClient(params);
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
  removeClient,
  commandName,
  commandDesc,
  commandSpec,
  commandHandler,
};

const shell = require('shelljs');
const logging = require('debug')('Weaver:bin:commands:add:client');
const { getConfig, setConfig } = require('../../lib/config');
const { generateId } = require('../../lib/utils');

const defaultMsg = `Usage
  weaver add client -f mongo -t source -n my_source_db -u mongodb://localhost:27017
`;

const clientExists = (client) => {
  const config = { ...getConfig() };
  const { dataClients } = config;
  return dataClients.some((c) => c.family === client.family
    && c.type === client.type
    && c.db.name === client.name);
};

const addClient = (config = {}) => {
  const {
    family, type, name, url,
  } = config;
  const clientId = generateId({ length: 8 });
  const newSettings = { ...getConfig() };
  const { dataClients } = newSettings;
  if (clientExists(config)) {
    shell.echo('Client exists, skipping');
    return newSettings;
  }
  logging(`Saving new settings ${newSettings}`);
  dataClients.push({
    clientId, family, type, db: { url, name, options: {} },
  });
  setConfig(newSettings);
  shell.echo('Saved new settings:', JSON.stringify(newSettings, null, 2));
  return newSettings;
};

const commandSpec = (yargs) => {
  shell.echo(defaultMsg);
  return yargs
    .option('family', { alias: 'f' })
    .option('type', { alias: 't' })
    .option('name', { alias: 'n' })
    .option('url', { alias: 'u' })
    .demandOption('family')
    .demandOption('type')
    .demandOption('name')
    .demandOption('url');
};

const commandHandler = (params) => {
  logging('client params', params);
  addClient(params);
  return params;
};

module.exports = {
  commandName: 'client',
  commandDesc: 'Interactive creation of a new client',
  commandSpec,
  commandHandler,
};

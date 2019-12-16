const shell = require('shelljs');
const logging = require('debug')('Weaver:bin:commands:add:client');
const { getConfig, setConfig } = require('../../lib/config');
const { generateId } = require('../../lib/utils');

const defaultMsg = `Usage
  weaver add client -f mongo -t [source|client] -o [<source.name>] -n my_source_db -u mongodb://localhost:27017
`;
const isSameFamily = (c, _c) => c.family === _c.family;
const isSameType = (c, _c) => c.type === _c.type;
const isSameName = (c, _c) => c.db.name === _c.name;
const clientExists = (client) => {
  const config = { ...getConfig() };
  const { dataClients } = config;
  const res = { exists: true };
  res.exists = dataClients.some((c) => {
    const matchFam = isSameFamily(c, client);
    const matchName = isSameName(c, client);
    const matchType = isSameType(c, client);
    const isSibling = matchFam && matchName && matchType;
    const sourceIsTarget = matchFam && matchName && !matchType;
    if (isSibling) res.message = 'Error: client exists';
    if (sourceIsTarget) res.message = 'Error: source and target clients are the same';
    return isSibling || sourceIsTarget;
  });
  return res;
};

const addClient = (config = {}) => {
  const {
    family, origin, type, name, url,
  } = config;
  const clientId = generateId({ length: 8 });
  const newSettings = { ...getConfig() };
  const { dataClients } = newSettings;
  const parity = clientExists(config);
  if (parity.exists) {
    shell.echo(parity.message);
    return newSettings;
  }
  logging(`Saving new settings ${newSettings}`);
  dataClients.push({
    clientId, family, type, origin, db: { url, name, options: {} },
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
    .option('origin', { alias: 'o' })
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

const shell = require('shelljs');
const logging = require('debug')('Weaver:bin:commands:add:client');
const { getConfig, setConfig } = require('../../lib/config');
const { generateId } = require('../../lib/utils');

const defaultMsg = `Usage:\n
  weaver add client -f [mongodb] -t [source|target] -o [<source.name>] -n my_source_db -u mongodb://localhost:27017
`;
const commandName = 'client';
const commandDesc = 'Creation of a new client';

const isSameFamily = (c, _c) => c.family === _c.family;
const isSameType = (c, _c) => c.type === _c.type;
const isSameName = (c, _c) => c.db.name === _c.name;
const isSameURL = (c, _c) => c.db.url === _c.url;

const clientExists = (client) => {
  const config = { ...getConfig() };
  const { dataClients } = config;
  const res = { exists: true };
  res.exists = dataClients.some((c) => {
    const matchFam = isSameFamily(c, client);
    const matchName = isSameName(c, client);
    const matchType = isSameType(c, client);
    const matchUrl = isSameURL(c, client);
    const isSibling = matchFam && matchName && matchType && matchUrl;
    const sourceIsTarget = matchFam && matchName && !matchType && matchUrl;
    if (isSibling) res.message = 'Error: client exists';
    if (sourceIsTarget) res.message = 'Error: source and target clients are the same';
    return isSibling || sourceIsTarget;
  });
  return res;
};
const validateParams = (config) => {
  const _config = config || {};
  const msgIntro = '[Invalid or missing parameter value]';
  const validation = { valid: true, message: null };
  if (_config.type === 'target' && (!_config.origin || !_config.origin.length)) {
    validation.valid = false;
    validation.message = `${msgIntro} 'origin', a target client's 'origin' should be the name of a 'source' client.`;
  }
  if (!_config.name || !_config.name.length) {
    validation.valid = false;
    validation.message = `${msgIntro} 'name', the client database name, ex: my_${_config.type}_db .`;
  }
  if (!_config.url || !_config.url.length) {
    validation.valid = false;
    validation.message = `${msgIntro} 'url', the client database url, ex: mongodb://localhost:27017 .`;
  }
  return validation;
};

const validateConfig = (config = {}) => {
  const validation = { valid: false, message: null };
  const parity = clientExists(config);
  const cfgValidation = validateParams(config);

  validation.valid = (
    parity.exists === false
    && cfgValidation.valid === true
  );

  validation.message = parity.message || cfgValidation.message;

  if (parity.exists) validation.message = parity.message;
  return validation;
};

const addClient = (config = {}) => {
  const {
    family, origin, type, name, url,
  } = config;
  const clientId = generateId({ length: 8 });
  const validation = validateConfig(config);

  if (!validation.valid) {
    shell.echo(validation.message);
    return false;
  }

  const newSettings = { ...getConfig() };
  const { dataClients } = newSettings;
  dataClients.push({
    clientId, family, type, origin, db: { url, name, options: {} },
  });
  return newSettings;
};

const commandSpec = (yargs) => {
  shell.echo(defaultMsg);
  return yargs
    .options({
      family: {
        alias: 'f',
        choices: [
          'mongodb',
        ],
        demandOption: true,
        describe: 'The client db family, `mongodb` for example.',
        type: 'string',
      },
      name: {
        alias: 'n',
        demandOption: true,
        describe: 'The client db name, `my_source_db` for example.',
        type: 'string',
      },
      origin: {
        alias: 'o',
        describe: 'For each target client there must be a source, origin is the name of the source client.',
        type: 'string',
      },
      type: {
        alias: 't',
        choices: ['source', 'target'],
        demandOption: true,
        describe: 'The client db type, `source` if data will be pulled from it, `target` otherwise.',
        type: 'string',
      },
      url: {
        alias: 'u',
        demandOption: true,
        describe: 'The client db url',
        type: 'string',
      },
    });
};

const commandHandler = (params) => {
  logging('client params', params);
  const newClientConfig = addClient(params);
  if (newClientConfig) {
    try {
      logging('Saving new client');
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
  addClient,
  clientExists,
  commandName,
  commandDesc,
  commandSpec,
  commandHandler,
  isSameFamily,
  isSameType,
  isSameName,
  isSameURL,
  validateParams,
  validateConfig,
};

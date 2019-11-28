const Debug = require('debug');
const { absPathname } = require('./shared');
const { showConfig, applyConfig } = require('./config');

const logging = Debug('Weaver:parse');

const parseOptions = (argvparsed) => {
  logging(argvparsed);
  if (!argvparsed) return;

  if (typeof argvparsed.config === 'string') {
    if (!argvparsed.config.length) showConfig();
    if (argvparsed.config.length) {
      const pathname = absPathname(argvparsed.config);
      applyConfig(pathname);
    }
  }
};


module.exports = {
  parseOptions,
};

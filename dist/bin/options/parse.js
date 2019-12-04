"use strict";

const Debug = require('debug');

const {
  absPathname
} = require('./shared');

const {
  showConfig,
  applyConfig
} = require('./config');

const logging = Debug('Weaver:parse');

const parseOptions = (argvparsed = {}) => {
  const cfg = argvparsed.config;
  logging(argvparsed);
  if (!argvparsed) return;

  if (typeof cfg === 'string') {
    if (!cfg.length) showConfig();
    if (cfg.length) applyConfig(absPathname(cfg));
  }
};

module.exports = {
  parseOptions
};
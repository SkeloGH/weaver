"use strict";

const path = require('path');

const Debug = require('debug');

const logging = Debug('Weaver:bin:options:shared');
const absPathname = path.resolve;
module.exports = {
  absPathname
};
const fs = require('fs');
const path = require('path');
const Debug = require('debug');

const logging = Debug('Weaver:bin:options:shared');

const absPathname = path.resolve;
const cfgAbsPath = absPathname(__dirname, './../.config.json');
const getJSONContent = (filePath) => {
  logging(`getJSONContent:filePath ${filePath}`);

  try {
    const content = fs.readFileSync(filePath);
    if (!content || !content.length) return null;
    const parsedContent = JSON.parse(content);
    logging(`getJSONContent:content ${content}`);
    return parsedContent;
  } catch (error) {
    const errorName = error.constructor.prototype.name.split(' ')[0];
    const handledErrs = ['SyntaxError', 'TypeError'];
    if (handledErrs.indexOf(errorName)) return null;
    throw error;
  }
};
const getCLIJSONContent = () => getJSONContent(cfgAbsPath);

module.exports = {
  absPathname,
  cfgAbsPath,
  getJSONContent,
  getCLIJSONContent,
};

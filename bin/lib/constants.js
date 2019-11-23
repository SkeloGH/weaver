const homePath = process.env.PWD.replace(process.env.HOME, '~');

module.exports = {
  CONFIG_PATH: `${homePath}/src/config/index.js`,
};

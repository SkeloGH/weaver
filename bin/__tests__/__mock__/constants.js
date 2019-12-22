const validFamily = 'mongodb';
const validTypeSource = 'source';
const validTypeTarget = 'target';
const validSourceName = 'my-source-db';
const validTargetName = 'my-target-db';
const validOrigin = validSourceName;
const validUrl = 'mongodb://localhost:27017';
const validBaseClient = {
  family: validFamily,
  url: validUrl,
};
const validSourceClient = {
  type: validTypeSource,
  name: validSourceName,
  ...validBaseClient,
};
const validTargetClient = {
  type: validTypeTarget,
  name: validTargetName,
  origin: validOrigin,
  ...validBaseClient,
};

module.exports = {
  validFamily,
  validTypeSource,
  validTypeTarget,
  validSourceName,
  validTargetName,
  validOrigin,
  validUrl,
  validBaseClient,
  validSourceClient,
  validTargetClient,
};

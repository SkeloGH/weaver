"use strict";const validFamily="mongodb",validTypeSource="source",validTypeTarget="target",validSourceName="my-source-db",validTargetName="my-target-db",validOrigin=validSourceName,validUrl="mongodb://localhost:27017",validBaseClient={family:"mongodb",url:validUrl},validSourceClient={type:validTypeSource,name:validSourceName,...validBaseClient},validTargetClient={type:validTypeTarget,name:validTargetName,origin:validOrigin,...validBaseClient};module.exports={validFamily:"mongodb",validTypeSource,validTypeTarget,validSourceName,validTargetName,validOrigin,validUrl,validBaseClient,validSourceClient,validTargetClient};
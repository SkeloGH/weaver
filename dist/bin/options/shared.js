"use strict";const fs=require("fs"),path=require("path"),Debug=require("debug"),logging=Debug("Weaver:bin:options:shared"),absPathname=path.resolve,cfgAbsPath=absPathname(__dirname,"./../.config.json"),getJSONContent=a=>{logging(`getJSONContent:filePath ${a}`);try{const b=fs.readFileSync(a),c=JSON.parse(b);return logging(`getJSONContent:content ${b}`),c}catch(a){const b=a.constructor.prototype.name.split(" ")[0];if(["SyntaxError","TypeError"].indexOf(b))return null;throw a}},getCLIJSONContent=()=>getJSONContent(cfgAbsPath);module.exports={absPathname,cfgAbsPath,getJSONContent,getCLIJSONContent};
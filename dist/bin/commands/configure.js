"use strict";const Debug=require("debug"),logging=Debug("Weaver:bin:commands:configure");module.exports={name:"configure",description:"Interactive configuration wizard",setup:a=>a,parse:a=>(logging("launch configuration wizard"),a)};
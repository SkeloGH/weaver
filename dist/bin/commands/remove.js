"use strict";const Debug=require("debug"),logging=Debug("Weaver:bin:commands:remove");module.exports={name:"remove",description:"Interactive removal of clients, queries or ignoreFields",setup:a=>{const b=a.command("client","Interactive removal of one or more clients",a=>a,a=>(logging("client params",a),a)).command("query","Interactive removal of one or more queries",a=>a,a=>(logging("query params",a),a)).command("ignoreField","Interactive removal of one or more ignoreFields",a=>a,a=>(logging("ignoreField params",a),a));return b},parse:a=>(logging("_argv",a),a)};
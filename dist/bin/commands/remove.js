"use strict";const Debug=require("debug"),{client}=require("./remove/"),logging=Debug("Weaver:bin:commands:remove");module.exports={name:"remove",description:"Interactive removal of clients, queries or ignores",setup:a=>{const b=a.command(client.commandName,client.commandDesc,client.commandSpec,client.commandHandler).command("query","Interactive removal of one or more queries",a=>a,a=>(logging("query params",a),a)).command("ignore","Interactive removal of one or more ignores",a=>a,a=>(logging("ignore params",a),a));return b},parse:a=>(logging("_argv",a),a)};
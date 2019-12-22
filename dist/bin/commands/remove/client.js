"use strict";const shell=require("shelljs"),logging=require("debug")("Weaver:bin:commands:add:client"),{getConfig,setConfig}=require("../../lib/config"),getClientIDs=()=>{const a={...getConfig()};return a.dataClients.map(a=>a.clientId)},clientIdString=getClientIDs().join(" "),defaultMsg=`Usage
  weaver remove client -i ${clientIdString}
`,commandName="client",commandDesc="Interactive removal of one or more existing clients",removeClient=(a={})=>{const b={...getConfig()},{dataClients:c}=b;return b.dataClients=c.filter(b=>-1<a.clientIds.indexOf(b.clientId)),b},commandSpec=a=>(shell.echo(defaultMsg),a.options({i:{alias:"clientIds",demandOption:!0,describe:"The clientIds to remove.",type:"array"}})),commandHandler=a=>{logging("client params",a);const b=removeClient(a);if(b)try{logging("Removing client with clientId"),setConfig(b),shell.echo("Saved new settings:",JSON.stringify(b,null,2))}catch(a){return shell.echo(a),!1}return a};module.exports={removeClient,commandName,commandDesc,commandSpec,commandHandler};
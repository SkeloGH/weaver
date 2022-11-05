"use strict";const ldColl=require("lodash/collection"),ldObject=require("lodash/object"),ldArray=require("lodash/array"),shell=require("shelljs"),logging=require("debug")("Weaver:bin:commands:add:ignore"),{getConfig,setConfig,getClientIDs}=require("../../lib/config"),clientIDs=getClientIDs();let defaultMsg=`Usage:\n
    weaver add ignore -i [clientID] -n [<namespace> ...]
`;defaultMsg+=clientIDs.length?`\nAvailable clientIDs: ${clientIDs.join(" ")}\n`:"\nNo clients are configured yet, try adding a client first.\n";const commandName="ignore",commandDesc="Add a collection/index namespace to ignore when performing queries",commandSpec=a=>(shell.echo(defaultMsg),a.options({clientid:{alias:"i",choices:clientIDs,demandOption:!0,describe:"The client id that will skip reading from the provided namespace.",type:"string"},namespaces:{alias:"n",demandOption:!0,describe:"The namespaces to avoid querying upon.",type:"array"}})),addIgnores=(a={})=>{const b={...getConfig()},c=ldColl.find(b.dataClients,b=>b.clientId===a.clientid),d=ldArray.findIndex(b.dataClients,b=>b.clientId===a.clientid),e=ldObject.assign({},c),f=e.client?e.client:{};let{ignoreFields:g=[]}=f;return 0>d?b:(g=g.concat(a.namespaces),f.ignoreFields=ldArray.uniq(g),e.client=ldObject.assign({},f),b.dataClients[d]=e,b)},commandHandler=a=>{logging("ignorefield params",a);const b=addIgnores(a);if(b)try{logging("Saving ignoreFields"),setConfig(b),shell.echo("Saved new settings:",JSON.stringify(b,null,2))}catch(a){return shell.echo(a),!1}return a};module.exports={commandName:"ignore",commandDesc,commandSpec,commandHandler,addIgnores};
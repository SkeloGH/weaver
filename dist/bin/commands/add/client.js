"use strict";const shell=require("shelljs"),logging=require("debug")("Weaver:bin:commands:add:client"),{getConfig,setConfig}=require("../../lib/config"),{generateId}=require("../../lib/utils"),defaultMsg=`Usage
  weaver add client -f [mongodb] -t [source|target] -o [<source.name>] -n my_source_db -u mongodb://localhost:27017
`,commandName="client",commandDesc="Interactive creation of a new client",isSameFamily=(a,b)=>a.family===b.family,isSameType=(a,b)=>a.type===b.type,isSameName=(a,b)=>a.db.name===b.name,clientExists=a=>{const b={...getConfig()},{dataClients:c}=b,d={exists:!0};return d.exists=c.some(b=>{const c=isSameFamily(b,a),e=isSameName(b,a),f=isSameType(b,a),g=c&&e&&f,h=c&&e&&!f;return g&&(d.message="Error: client exists"),h&&(d.message="Error: source and target clients are the same"),g||h}),d},validateParams=(a={})=>{const b={valid:!0,message:null};return"target"!==a.type||a.origin&&a.origin.length||(b.valid=!1,b.message=`${"[Invalid or missing parameter value]"} 'origin', a target client's 'origin' should be the name of a 'source' client.`),a.name&&a.name.length||(b.valid=!1,b.message=`${"[Invalid or missing parameter value]"} 'name', the client database name, ex: my_${a.type}_db .`),a.url&&a.url.length||(b.valid=!1,b.message=`${"[Invalid or missing parameter value]"} 'url', the client database url, ex: mongodb://localhost:27017 .`),b},validateConfig=(a={})=>{const b={valid:!1,message:null},c=clientExists(a),d=validateParams(a);return b.valid=!1===c.exists&&!0===d.valid,b.message=c.message||d.message,c.exists&&(b.message=c.message),b},addClient=(a={})=>{const{family:b,origin:c,type:d,name:e,url:f}=a,g=generateId({length:8}),h=validateConfig(a);if(!h.valid)return shell.echo(h.message),!1;const i={...getConfig()},{dataClients:j}=i;return j.push({clientId:g,family:b,type:d,origin:c,db:{url:f,name:e,options:{}}}),i},commandSpec=a=>(shell.echo(defaultMsg),a.options({family:{alias:"f",choices:["mongodb"],demandOption:!0,describe:"The client db family, `mongodb` for example.",type:"string"},name:{alias:"n",demandOption:!0,describe:"The client db name, `my_source_db` for example.",type:"string"},origin:{alias:"o",describe:"For each target client there must be a source, origin is the name of the source client.",type:"string"},type:{alias:"t",choices:["source","target"],demandOption:!0,describe:"The client db type, `source` if data will be pulled from it, `target` otherwise.",type:"string"},url:{alias:"u",demandOption:!0,describe:"The client db url",type:"string"}})),commandHandler=a=>{logging("client params",a);const b=addClient(a);if(b)try{logging("Saving new client"),setConfig(b),shell.echo("Saved new settings:",JSON.stringify(b,null,2))}catch(a){return shell.echo(a),!1}return a};module.exports={addClient,clientExists,commandName,commandDesc,commandSpec,commandHandler,isSameFamily,isSameType,isSameName,validateParams,validateConfig};
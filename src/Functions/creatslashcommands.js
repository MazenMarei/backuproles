const { Client} = require("discord.js");
const { Console } = require('console');
const { Transform } = require('stream');
/**
 * 
 * @param {Client} client 
 */
async function createSlashCommand(client) {
  let Guilds = await client.guilds.fetch().catch((err) => null);
  if(!Guilds) return console.log(`An issue occurred while fetching servers."`)

  await Guilds.map(async guild => { 
      if(!guild) return;
      let guildConfig = client.guildsConfig.get(guild.id);
      let commands = client.commands?.map(d => {
         if(d.config?.permissions) d.config.defaultMemberPermissions = d.config.permissions;
       
         if(guildConfig && d.config?.langFileName){ 
          d.config.description = client.language[guildConfig.language].commands[d.config.langFileName].description

        };
         
         return d.config 
        }); 

      let commandsD = await client.application.commands.set(commands,guild.id).catch((err) => null);
      if(!commandsD)  console.log(`I was unable to add slash commands to [${guild.name}]`)
      if(commandsD) table(commandsD.map(d => ({  name: d.name,server: guild.name})))
    })
};
module.exports = {
    createSlashCommand
};



















function table(input) {
  // @see https://stackoverflow.com/a/67859384
  const ts = new Transform({ transform(chunk, enc, cb) { cb(null, chunk) } })
  const logger = new Console({ stdout: ts })
  logger.table(input)
  const table = (ts.read() || '').toString()
  let result = '';
  for (let row of table.split(/[\r\n]+/)) {
    let r = row.replace(/[^┬]*┬/, '┌');
    r = r.replace(/^├─*┼/, '├');
    r = r.replace(/│[^│]*/, '');
    r = r.replace(/^└─*┴/, '└');
    r = r.replace(/'/g, ' ');
    result += `${r}\n`;
  }
  console.log(result);
};
const { Client , Collection , Guild} = require("discord.js");
/**
 * 
 * @param {Client} client 
 * @param {Guild} guild
 */
async function rolebackupready(client) {
  let Guilds = await client.guilds.fetch().catch((err) => null);
  if(!Guilds) return console.log(`An issue occurred while fetching servers."`)

  await Guilds.map(async guild => { 
      if(!guild) return;
       guild = await client.guilds.fetch(guild.id)
        fetchMembers(client,guild);

  })
}



async function fetchMembers(client , guild) {
    let members = new Collection();
    let ids = []
  let fetchedMembers;
  do {
    fetchedMembers = await guild.members.fetch({ limit: 100 ,force: true});
    members = members.concat(fetchedMembers);
  } while (fetchedMembers.size === 100);
  client.members.set(guild.id , members)
}


module.exports = {
    rolebackupready,
    fetchMembers
}
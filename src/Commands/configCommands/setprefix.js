const {Client , Message,PermissionsBitField} = require("discord.js");
let Discord = require("discord.js");
let langExample = require("../../../language/ar.json");
let guildModule = require("../../../models/guildConfig")

/**
 * 
 * @param {Client} client
 * @param {Message} message 
 * @param {String[]} args 
 * @param {langExample} language 
 * @param {Array} otherInfo 
 */


module.exports.run = async (client,message,args,language,otherInfo ) => {
 let prefix = args[1]?.trim();
 if(!prefix) return message.reply({
  embeds: [new Discord.EmbedBuilder().setColor(client.embedColor)
  .setDescription(`**_${this.config.Usage}_**`)]
 });
 if(!prefix.length > 2) return message.reply({
  embeds: [new Discord.EmbedBuilder().setColor(client.embedColor)
  .setDescription(`**_${language.setprefix.longPrefix}_**`)]
 });
 let guildData = await guildModule.findOne({guildId:message.guild.id,});
 if(guildData?.prefix === prefix) return message.reply({
  embeds: [new Discord.EmbedBuilder().setColor(client.embedColor)
  .setDescription(`**_${language.setprefix.samePrefix}_**`)]
 });
 if(!guildData) {
  guildData = await new guildModule({
           guildId: message.guildId,
           prefix,
  }).save()
 }

 else {
  guildData.prefix = prefix;

  await guildData.save();
  }

  client.guildsConfig.delete(message.guildId);
  client.guildsConfig.set(message.guildId, {
    guildId: message.guildId,
    prefix: guildData.prefix,
    language: guildData.language
  });


 await message.reply({
  embeds: [new Discord.EmbedBuilder().setColor(client.embedColor)
  .setDescription(`**_${language.setprefix.successfully} \`${guildData.prefix}\`_**`)]
 })
}



module.exports.config = {
            module : [{name : "Client , Message" , module : "discord.js"} , {name : "pkg" , module : "getmac"}],
            name:"setprefix",
            aliases : ["prefix"],
            coolDown : 60,
            permissions:  new PermissionsBitField("Administrator").toArray(),
            name_localizations:{
              "fr" : "aider"
            },
            description:"Getting help.",
            "description_localizations" : {
              "fr" : "Obtenir de l’aide"
            },
 /** @type {Discord.SlashCommandOptionsOnlyBuilder} */
 options : [new Discord.SlashCommandStringOption()
  .setName("prefix")
  .setRequired(true)
  .setMinLength(1)
  .setMaxLength(2)
  .setDescription("The new prefix"),],
          Usage : {
            ar : "للمساعدة"
          }
            
  }



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
   let {setlanguage} = language
 let alllanguage = Object.keys(client.language).filter(o => client.language[o]?.languageInfo?.name !== language.languageInfo.name);;

 let menu = new Discord.StringSelectMenuBuilder().setCustomId("language").setPlaceholder(setlanguage.menuPlaceholder).setMaxValues(1)
 .setMinValues(1);


 alllanguage.map(d => menu.addOptions({
    label: client.language[d].languageInfo.name,
    value: d,
    emoji: client.language[d].languageInfo.flag,
 }))

let msg = await message.reply({
    components: [new Discord.ActionRowBuilder().addComponents(menu)]
 }).catch((err) => null);
 if(!msg) return
 const collector = msg.createMessageComponentCollector({ filter: (u) => u.member.id === message.member.id && u.customId === "language",max:1,  componentType: Discord.ComponentType.StringSelect, time:35000 });
 collector.on("collect", async i => {
    await i.deferReply().catch((err) => null)
    let selectedLang = i.values[0];
    let guildData = await guildModule.findOne({guildId:message.guild.id,});

    if(!guildData) {
        guildData = await new guildModule({
            guildId: message.guildId,
            language: selectedLang
    }).save();
    }
    else {
        guildData.language = selectedLang;
        await guildData.save();
    }
    client.guildsConfig.delete(message.guildId);
    client.guildsConfig.set(message.guildId, {
      guildId: message.guildId,
      prefix: guildData.prefix,
      language: guildData.language
    });

    setlanguage = client.language[guildData.language].setlanguage;
    await i.editReply({
       
            embeds: [new Discord.EmbedBuilder().setColor(client.embedColor)
            .setDescription(`**_${setlanguage.successfully} \`${client.language[guildData.language].languageInfo.name}\`_**`)]
    }).catch((err) => null)
 });
collector.on("end", async () => {
    await msg.delete().catch((err) => null)
});

}



module.exports.config = {
            module : [{name : "Client , Message" , module : "discord.js"} , {name : "pkg" , module : "getmac"}],
            name:"setlang",
            aliases : ["setlanguage","language","lang"],
            coolDown : 60,
            permissions:  new PermissionsBitField("Administrator").toArray(),
            name_localizations:{
              "fr" : "aider"
            },
            description:"Getting help.",
            "description_localizations" : {
              "fr" : "Obtenir de l’aide"
            },
            options : [ ],
          Usage : {
            ar : "للمساعدة"
          }
            
  }



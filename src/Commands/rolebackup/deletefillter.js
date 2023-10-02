const {Client , Message ,PermissionsBitField,Collection,TextInputBuilder , StringSelectMenuBuilder , StringSelectMenuOptionBuilder , ActionRowBuilder , EmbedBuilder, messageLink , ButtonBuilder , ButtonStyle , ModalBuilder, TextInputStyle,RoleSelectMenuBuilder} = require("discord.js")
const runningCmd = new Map()  
let langExample = require("../../../language/ar.json");
const protection = require("../../../models/protection")
const membersRolesConfig = require("../../../models/membersroles")
const {fetchMembers} = require("../../Functions/rolebackupready")
const {menuCreate} = require("../../Functions/menupages");
/**
 * 
 * @param {Client} client
 * @param {Message} message 
 * @param {String[]} args 
 * @param {langExample} language 
 * @param {Array} otherInfo 
 */



module.exports.run = async (client , message, args,language,otherInfo , runningCmd) => { 

    ///// importan data 
    let allUsers = await message.guild.members.cache.map(m => m.id)
    let protectFillter = (await protection.find({guildId : message.guildId})).map(a => ({
        label : a?.fillterName,
        value : a?.fillterName,
        Description : `⚒   |  ${a?.fillterType} ≪ ${a.roles.length > 0 ? a.roles.length :  a.permissions.length} ≫ ══ ✋ | ≪ ${a.fillterlimit} ≫  ══ 👤 | ≪ ${a.users.length} ≫`,
    }))
    if(protectFillter.length <= 0) {
        runningCmd.delete(message.author.id)   
        return message.reply({embeds : [new EmbedBuilder()
            .setColor(16711680)
            .setAuthor({name : message.author.username , iconURL : message.author.avatarURL()})
            .setTitle(language.applyprotect.errorEmbed.title + " ❌")
            .setDescription("```\n" + language.applyprotect.errorEmbed.noprotection + "\n```")
          ]})
      } 
    //// configuration Embed and message
    let configurationEmbed = new EmbedBuilder()
    .setColor("#f8f8f8")
    .setAuthor({name : message.author.username , iconURL : message.author.avatarURL()})
    .setTimestamp()
    .setTitle(language.deleteFillter.configurationEmbed.Title)
    .setFooter({text  : message.guild.name , iconURL : message.guild.iconURL()})

    let configurationMsg = await message.reply({embeds : [configurationEmbed]})
    //// filter menu 
    
    let filterMenu = await menuCreate(protectFillter , configurationMsg , language.deleteFillter.menuPlaceholder , language , {MinValues : 1 , MaxValues : 25} , true)
    
    if (filterMenu.canceled) {
        runningCmd.delete(message.author.id)
                return await configurationMsg.delete().catch(err => null)
      }

    let deleted = 0
    let users = []
    let deletedProtect = ""
    /// delete fillter 
    for (let index = 0; index < filterMenu.values.length; index++) {
        const firstData = filterMenu.values[index];
                if(firstData.length > 0) deletedProtect +="═══════════════ ≪ "+`${index + 1}`+" ≫ ═══════════════\n"
                for (let index = 0; index < firstData.length; index++) {
                    const secData = firstData[index];
                    let fillterUsers = (await protection.findOne({guildId : message.guildId , fillterName : secData}))?.users
                    users = [...new Set(users.concat(fillterUsers))]
                    let delet =  await protection.findOneAndDelete({guildId : message.guildId , fillterName : secData})
                    for (let index = 0; index < fillterUsers.length; index++) {
                        const user = fillterUsers[index];
                        let userdata = await membersRolesConfig.findOne({guildId : message.guildId , memberID : user})
                        if(userdata) { 
                            await membersRolesConfig.findOneAndUpdate(
                                {guildId : message.guildId , memberID : user},
                                {
                                    protectionFilter :  userdata.protectionFilter.splice(userdata.protectionFilter.indexOf(secData),1)
                                },
                                {
                                    overwrite:false,
                                    upsert :true,
                                    new : true,
                                    setDefaultsOnInsert : true
                                }
                                )
                        }
                    }
                    deletedProtect += ">  :hammer_pick:   |   ** " +secData+"**\n"
                    deleted ++
                }
    }
    ////done delete 

    configurationEmbed.setColor(8183680)
    .setTitle(configurationEmbed.data.title+" ✅")
    .setDescription(deletedProtect)
    .addFields(
        {name : "> " + language.deleteFillter.configurationEmbed.membercount , value : "```js\n\"" +users.length+"\"\n```", inline : true},
        {name : "> " +  language.deleteFillter.configurationEmbed.fillters, value : "```js\n\"" +deleted+"\"\n```", inline : true}    )
    await configurationMsg.edit({embeds : [configurationEmbed] , components: []})
    runningCmd.delete(message.author.id)





}


module.exports.config = {
    name:"deletefilter",
    description : "to delete protection filter from the data and all users",
    aliases : ["df"],
    coolDown : 0,
    permissions:  new PermissionsBitField("Administrator").toArray(),
    langFileName : "deletefilter",
  Usage : {
    en : "to delete protection filter",
  }
    
} 
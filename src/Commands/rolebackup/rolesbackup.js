const {Client , Message ,PermissionsBitField,Collection,TextInputBuilder , StringSelectMenuBuilder , StringSelectMenuOptionBuilder , ActionRowBuilder , EmbedBuilder, messageLink , ButtonBuilder , ButtonStyle , ModalBuilder} = require("discord.js")
const runningCmd = new Map()  
let langExample = require("../../../language/ar.json");
const membersRolesConfig = require("../../../models/membersroles")
const {fetchMembers} = require("../../Functions/rolebackupready")
const {menuCreate} = require("../../Functions/menupages")
/**
 * 
 * @param {Client} client
 * @param {Message} message 
 * @param {String[]} args 
 * @param {langExample} language 
 * @param {Array} otherInfo 
 */



module.exports.run = async (client , message, args,language,otherInfo , runningCmd) => {
    let rolescount = 0
    let membercount= 0
    ////
    
    //// get guild role backup data <start>
    // let guildData = await rolesBackupConfig.findOne({guildId : message.guildId})
    // if (!guildData) {
    //     //// delete runningCmd
    //     runningCmd.delete(message.author.id)
    //     let noguilddataembed = new EmbedBuilder()
    //     .setTitle("> "+language.rolesbackup.noguilddataembed.title+" ❌")
    //     .setDescription(`\`\`\`diff\n- ${language.rolesbackup.noguilddataembed.description}\n\`\`\``)
    //     .setColor(16711680)
    //     return message.reply({embeds:[noguilddataembed] })
    // }
    //// get guild role backup data <end>

    await fetchMembers(client , message.guild)
    let memberdata
    client.members.get(message.guildId).map(member => {
        memberdata = membersRolesConfig.findOneAndUpdate({
            guildId: message.guildId,
            memberID : member.user.id,
        }, {
            membercount : membercount++,
            roles :  member.roles.cache.map((role)=> ({
                roleID : role.id,
                roleName : role.name,
                roleColor : role.color,
                rawPosition : role.rawPosition,
                permissions : role.permissions,
                rolecount : rolescount++
            }))
        }, {
            overwrite:false,
            upsert :true,
            new : true,
            setDefaultsOnInsert : true
        }).catch(err => console.log(err))
        });
    


    let  donemebed = new EmbedBuilder()
    .setTitle(language.rolesbackup.succembed.title+" ✅")
    .setColor(8183680)
    .addFields({ 
    "name": "> "+ language.rolesbackup.succembed.memberscount,
    "value": "```bash\n\""+membercount+"\"\n```",
    "inline": true
    },{
        "name": "> " + language.rolesbackup.succembed.rolesCount,
        "value": "```bash\n\""+rolescount +"\"\n```",
        "inline": true
      })
      .setAuthor({name : message.author.username , iconURL : message.author.avatarURL()})
      .setFooter({text :message.guild.name , iconURL :message.guild.iconURL()  })
      .setThumbnail(message.guild.iconURL())
      .setTimestamp()
    await message.reply({embeds : [donemebed]})
// delete runningCmd
runningCmd.delete(message.author.id)
}


module.exports.config = {
    name:"rolesbackup",
    description : "to backup members' roles",
    aliases : ["rb"],
    coolDown : 20,
    permissions:  new PermissionsBitField("Administrator").toArray(),
    langFileName : "rolesbackup",
  Usage : {
    en : "to backup members' roles",
  }
    
} 
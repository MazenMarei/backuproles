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
    //// chek if user mentioned 
    let selectedUser = [];
    if (args?.length > 0) {
        for (let argData of args) {
            argData = argData.match(/\d+/)
            let getUser = await message.guild.members.fetch(argData.toString())
            if(getUser)  {
                selectedUser.push(getUser.user.id)
            }
        
        }
      }
    let allUsers = await message.guild.members.cache.map(m => m.id)
    if(selectedUser.length <= 0)  selectedUser = selectedUser.concat(allUsers)
    let protactions = (await protection.find({guildId : message.guildId}))
      if(protactions.length <= 0) {
        runningCmd.delete(message.author.id)   
        return message.reply({embeds : [new EmbedBuilder()
            .setColor(16711680)
            .setAuthor({name : message.author.username , iconURL : message.author.avatarURL()})
            .setTitle(language.applyprotect.errorEmbed.title + " ❌")
            .setDescription("```\n" + language.applyprotect.errorEmbed.noprotection + "\n```")
          ]})
      } 
      protactions =  protactions.map(a => ({
        label : a?.fillterName,
        value : a?.fillterName,
        Description : `⚒   |  ${a?.fillterType} ≪ ${a.roles.length > 0 ? a.roles.length :  a.permissions.length} ≫ ══ ✋ | ≪ ${a.fillterlimit} ≫  ══ 👤 | ≪ ${a.users.length} ≫`,
        emoji : undefined
        }))
    let configurationEmbed = new EmbedBuilder()
    .setAuthor({name : message.author.username , iconURL : message.author.avatarURL()})
    .setTitle(language.addfilter.configurationEmbed.Title)
    .setColor("#f8f8f8")
    .setTimestamp()
    .setFooter({text : message.guild.name , iconURL : message.guild.iconURL()})
    .addFields(
        {name : "> " + language.applyprotect.configurationEmbed.members , value : "```js\n\""+selectedUser.length + "\" \n```", inline : true}
        )
        
    let configurationMsg = await message.reply({embeds : [configurationEmbed]})
    let protectionList = []
    let protactionsMenu = await  menuCreate( protactions , configurationMsg , language.applyprotect.Placeholder , language , {MinValues : 1 , MaxValues : 25} ,true )
    if (protactionsMenu.canceled) {
        runningCmd.delete(message.author.id)
                return await configurationMsg.delete().catch(err => null)
      }
    protactionsMenu.values.map(first => {
        if(first.length <= 0) return
        first.map(sec => {if(sec) protectionList.push(sec)})
    })
    configurationEmbed.addFields(
        {name : "> " + language.applyprotect.configurationEmbed.prtotectioncount , value : "```js\n\""+protectionList.length + "\" \n```", inline : true}
        )
    let Success = {num : 0}
    selectedUser.map(async user => {
        let oldData = await membersRolesConfig.findOne( {guildId : message.guildId , memberID : user})
        if(oldData?.protectionFilter.length > 0) protectionList = [...new Set(protectionList.concat(oldData?.protectionFilter)) ]
        let memebrProtect = await membersRolesConfig.findOneAndUpdate(
            {guildId : message.guildId , memberID : user},
            {    
            guildId : message.guildId,
            memberID : user,
            protectionFilter : protectionList
            },
            {
            overwrite:false,
            upsert :true,
            new : true,
            setDefaultsOnInsert : true
            }
            ).catch(err =>  false)
        if (memebrProtect) return Success.num ++
         
        })

        protectionList.map(async protectdatat => {
          let data = await protection.findOne({guildId : message.guildId ,fillterName :  protectdatat})
          if (!data) return
          let updataData = await protection.findOneAndUpdate({guildId : message.guildId ,fillterName :  protectdatat} ,
             {
              users :       [...new Set(data.users.concat(selectedUser)) ]    
            },
             { overwrite:false,
              upsert :true,
              new : true,
              setDefaultsOnInsert : true}).catch(err =>  false)
        })
    let pagesData = ""
    for (let index = 0; index < protactionsMenu.values.length; index++) {
    const element = protactionsMenu.values[index];
    if(element.length > 0)     pagesData +="═══════════════ ≪ "+`${index + 1}`+" ≫ ═══════════════\n"
    element.map(a => {
         pagesData+= ">  :hammer_pick:   |   ** " +a+"**\n"
    })
    }


    if(pagesData.length > 4096 ) {
        var chunks = pagesData.match (/. {1,4096}gs/);
for (var i = 0; i < chunks.length; i++) {
var embed = new EmbedBuilder() 
  .setDescription(chunks[i]) 
message.channel.send({ embeds: [embed] }); 
}
} else {
configurationEmbed
    .setColor(8183680)
    .setTitle(configurationEmbed.data.title+" ✅")
    .setDescription(pagesData)
await configurationMsg.edit({embeds : [configurationEmbed] , components: []})

}

      runningCmd.delete(message.author.id)
}



module.exports.config = {
    name:"applyprotect",
    description : "to appply protection for guild or user",
    aliases : ["applyp"],
    coolDown : 0,
    permissions:  new PermissionsBitField("Administrator").toArray(),
    langFileName : "applyprotect",
    options : [
      {
        name : "user",
        type : 2,
        description	: "user to apply protection on" , 
        required : false
      },
  ],
  Usage : {
    en : "to setup protection for the server ",
  }
    
} 
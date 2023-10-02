const {Client , Message ,PermissionsBitField,Collection,TextInputBuilder , StringSelectMenuBuilder , StringSelectMenuOptionBuilder , ActionRowBuilder , EmbedBuilder, messageLink , ButtonBuilder , ButtonStyle , ModalBuilder, TextInputStyle,RoleSelectMenuBuilder} = require("discord.js")
const runningCmd = new Map()  
let langExample = require("../../../language/ar.json");
const protection = require("../../../models/protection")
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
  let Permissions = Object.keys(PermissionsBitField.Flags).map((a)=>({
      label : a,
      value : a
    }))
  let guildRoles = (await message.guild.roles.fetch()).map((a)=>({
        Description : "👤 | "+a.members.size, 
        label : a.name,
        value : a.id,
        // Emoji : a.color.toString()
  }))

  let data  = { 
      fillterName : null,
      fillterlimit : 0,
      fillterType : null,
      JoinType : null,
      approvalChannel : null,
      roles : [],
      permissions : []
  }


    /// configuration Embed <start>
  
    let configurationEmbed = new EmbedBuilder()
    .setAuthor({name : message.author.username , iconURL : message.author.avatarURL()})
    .setTitle(language.addfilter.configurationEmbed.Title)
    .setColor("#f8f8f8")
    /// configuration Embed <end>




  if (args?.length > 0) {
    for (let argData of args) {
      if (!data.JoinType)        if (["auto" , "approval" ].includes(argData))  {
        data.JoinType = argData 
        configurationEmbed.addFields({name : "> "+language.rolebackuptype.configurationEmbed.type , value : data.type === "auto"? "```"+language.rolebackuptype.roleBackupTypeMenu.menuoptions[0].label+"```": "```"+language.rolebackuptype.roleBackupTypeMenu.menuoptions[1].label+"```" , inline : true})
    } else if (Number(argData)) data.fillterlimit = argData
     else if(["Roles" , "Permissions"].includes(argData)) data.fillterType = argData
     else data.fillterName = argData
    
    }
  }
/// create protection modal <start>






  /// fillter modal Btn <start>

  let newModalBtn = new ButtonBuilder()
  .setCustomId("newModalBtn")
  .setEmoji("➕")
  .setStyle("Success")
  // .setLabel(language.addfilter.newModalBtn.Label)

  /// fillter modal Btn <end>





  /// fillter Modal <start>
  
  let fillterModal = new ModalBuilder()
    .setCustomId("protectionFillter")
    .setTitle(language.addfilter.fillterModal.Title)
    

    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder({
        
          custom_id : "fillter_name",
          label : language.addfilter.fillterModal.nameLabel,
          placeholder : language.addfilter.fillterModal.namePlaceholder,
          style : 1,
          required : true
        
      })
      ),
      new ActionRowBuilder().addComponents(
          new TextInputBuilder({
            custom_id : "fillter_limit",
            label : language.addfilter.fillterModal.limitLabel,
            placeholder : language.addfilter.fillterModal.limitPlaceholder,
            style : 1,
            required: false
          
        })
      )
    )

  /// fillter Modal <end>


  

  let btnRow = new ActionRowBuilder().addComponents(newModalBtn)
  let configurationMsg = await message.reply({embeds : [configurationEmbed] })

  if (!data.fillterName) await newModal(configurationMsg , btnRow , message , data , fillterModal)
  


  //// chek the name of fillter 
  let oldData = await protection.findOne({guildId : message.guildId , fillterName : data.fillterName})
  if (oldData) {
    runningCmd.delete(message.author.id)   
    if(configurationMsg) configurationMsg.delete()
    return message.reply({embeds : [new EmbedBuilder()
    .setColor(16711680)
    .setAuthor({name : message.author.username , iconURL : message.author.avatarURL()})
    .setTitle(language.addfilter.errorEmbed.title + " ❌")
    .setDescription("```\n" + language.addfilter.errorEmbed.alreadyfillter + "\n```")
  ]})}
  ////
  await configurationEmbed.addFields(
    {name : "> " + language.addfilter.configurationEmbed.fillterName , value : "```js\n\"" + data.fillterName + "\"```" , inline : true},
    {name : "> " + language.addfilter.configurationEmbed.fillterlimit , value : "```js\n\"" + data.fillterlimit + "\"```" , inline : true},
    )

  await configurationMsg.edit({embeds : [configurationEmbed]})
  



        //// join type 
      if(!data.JoinType) {
        let typedata = [
          {
            label : language.rolebackuptype.roleBackupTypeMenu.menuoptions[0].label,
            value : "auto",
            Description : language.rolebackuptype.roleBackupTypeMenu.menuoptions[0].Description,
            Emoji : "✨"
          },
          {
            label : language.rolebackuptype.roleBackupTypeMenu.menuoptions[1].label,
            value : "approval",
            Description : language.rolebackuptype.roleBackupTypeMenu.menuoptions[1].Description,
            Emoji : "✅"
          }
        ]
        
        let menuData = await menuCreate(typedata , configurationMsg,language.rolebackuptype.roleBackupTypeMenu.Placeholder, language , {MaxValues : 1 , MinValues : 1})
    
        if (menuData.canceled) {
          runningCmd.delete(message.author.id)
                  return await configurationMsg.delete().catch(err => null)
        }

        configurationEmbed.addFields({name : "> "+language.rolebackuptype.configurationEmbed.type , value : menuData.values[0][0] === "auto"?"```"+language.rolebackuptype.roleBackupTypeMenu.menuoptions[0].label+"```":"```"+language.rolebackuptype.roleBackupTypeMenu.menuoptions[1].label +"```", inline : true})
        data.type = menuData.values[0][0]
        await  configurationMsg.edit({embeds: [configurationEmbed], components: []})

      }

        //// get approval channel
        if(data.type === "approval" && !data.approvalChannel) { 
              /// setup channels menue <start>
        let Guild_channels = message.guild.channels.cache.filter(a => a.type === 0).sort((a,b) => a?.rawPosition - b?.rawPosition).map((channel)=> ({
          label : channel.name,
          value : channel.id,
          Description : channel?.parent.name?channel?.parent.name:language.ticketSetup.NoParent,
        }))
        let channelMenue = await menuCreate(Guild_channels , configurationMsg,language.rolebackuptype.approvalchannelmenu.channelsMenuPlaceholder, language , {MaxValues : 1 , MinValues : 1} , false)
        if (channelMenue.canceled) {
          runningCmd.delete(message.author.id)
                  return await configurationMsg.delete().catch(err => null)
        }
          let selectedChannel ;
          channelMenue.values.map(a => {
            if(a.length <= 0) return
            selectedChannel = a
          })
          configurationEmbed.addFields({name : "> "+language.rolebackuptype.configurationEmbed.approvalChannel , value : `<#${selectedChannel}>`, inline : true})
          configurationMsg.edit({
            components: [],
            embeds : [configurationEmbed]
          })
          data.approvalChannel = selectedChannel
        }
        ////
                //// fillter type <start>
                let filterType = [
                  {
                    label : language.addfilter.PermissionsFillter,
                    Description : language.addfilter.PermissionsFillterDescription,
                    value: "Permissions",
                    Emoji : "✨" 
                  },
                  {
                    label : language.addfilter.RolesFillter,
                    Description : language.addfilter.RolesFillterDescription,
                    value: "Roles",
                    Emoji : "💫" 
                  }
                ]
                if(!data.fillterType) {
                  let fillterTypeMenu = await menuCreate(filterType,configurationMsg,language.addfilter.fillterTypePlaceholder,language,{MaxValues : 1 , MinValues : 1}, false)
                  if (fillterTypeMenu.canceled) {
                    runningCmd.delete(message.author.id)
                            return await configurationMsg.delete().catch(err => null)
                  }
                  data.fillterType = fillterTypeMenu.values[0][0]
                  fillterTypeMenu.Menucollector.stop()
                  fillterTypeMenu.Btncollector.stop()
                }
                await configurationEmbed.addFields(
                  {name : "> " + language.addfilter.configurationEmbed.fillterType , value : "```js\n\"" + data.fillterType + "\"```" , inline : true},
                  )
                await configurationMsg.edit({embeds : [configurationEmbed]})

        let fillterData;
        if(data.fillterType === "Roles") {
          fillterData = await menuCreate(guildRoles,configurationMsg,language.addfilter.rolesplacehoder,language,{MaxValues : 25 , MinValues : 1} , true)
          if (fillterData.canceled) {
            runningCmd.delete(message.author.id)
                    return await configurationMsg.delete().catch(err => null)
          }
          data.roles = fillterData.values
        }
        if (data.fillterType === "Permissions"){
          fillterData = await menuCreate(Permissions,configurationMsg,language.addfilter.permissionsplacehoder,language,{MaxValues : 25 , MinValues : 1},true)
          if (fillterData.canceled) {
            runningCmd.delete(message.author.id)
                    return await configurationMsg.delete().catch(err => null)
          }
          data.permissions = fillterData.values
        }
        let pagesData = ""
        for (let index = 0; index < fillterData.values.length; index++) {
          const element = fillterData.values[index];
          if(element.length > 0)     pagesData +="═══════════════ ≪ "+`${index + 1}`+" ≫ ═══════════════\n"
          element.map(a => {
            if(Number(a))   pagesData+="<@&"+a+">\n"
            else pagesData+= a+"\n"
          })
        }
     
        let dataChek = await new protection({
          guildId : message.guildId,
          
        fillterName : data.fillterName,
        fillterlimit : data.fillterlimit,
        fillterType : data.fillterType,
        roles : data.roles,
        permissions : data.permissions 
        }).save()
          if(!dataChek)  {   
            runningCmd.delete(message.author.id)    
            let cmderrorembed = new EmbedBuilder()
            .setTitle("> "+language.rolesbackup.noguilddataembed.title+" ❌")
            .setDescription(`\`\`\`diff\n- ${language.rolesbackup.noguilddataembed.error2description}\n\`\`\``)
            .setColor(16711680)
            return message.reply({embeds: [cmderrorembed]}) 
            }
        if(pagesData.length > 4096 ) {
                  var chunks = pagesData.match (/. {1,4096}gs/); // returns an array of substrings
        for (var i = 0; i < chunks.length; i++) {
          var embed = new EmbedBuilder() 
            .setDescription(chunks[i]) 
          message.channel.send({ embeds: [embed] }); 
        }
        } else {
          configurationEmbed.setDescription(pagesData)
          .setColor(8183680)
          .setTitle(language.addfilter.configurationEmbed.Title+" ✅")
          await configurationMsg.edit({embeds : [configurationEmbed] , components: []})
          
        }

        //// fillter type <end>
  runningCmd.delete(message.author.id)









  /// create protection modal <end>
}


module.exports.config = {
    name:"addfilter",
    description : "to setup protection for the server ",
    aliases : ["addf"],
    coolDown : 20,
    permissions:  new PermissionsBitField("Administrator").toArray(),
    langFileName : "addfilter",
    options : [
      {
        name : "fillter_name",
        type : 3,
        description	: "protaction fillter name" , 
        required : true
      },
    {
      name : "protection",
      type : 3,
      description	: "protection type" , 
      choices : [
        {name : "roles protection "     , value : "Roles"} ,
        {name : "permissions protection "  , value : "Permissions"} ,
      ],
      required : true
    },
    {
      name : "join_type",
      type : 3,
      description	: "Join type" , 
      choices : [
        {name : "auto join"    , value : "auto"} ,
        {name : "approval"  , value : "approval"} ,
      ],
      required : true
    },
      {
      type : 4	,
      name	:"join_limit",
      description	: "limit of returnning roles." , 
      required : false ,
    }
  ],
  Usage : {
    en : "to setup protection for the server ",
  }
    
} 



async function newModal(configurationMsg , btnRow , message ,  data  , fillterModal) {
  return new Promise(async (resolve, reject) => {
    await configurationMsg.edit({components : [btnRow]})

  const buttonFilter =  i => i.user.id === message.author.id &&  "newModalBtn"==  i.customId && i.message.id ===  configurationMsg.id;

  const Btncollector = configurationMsg.createMessageComponentCollector({ buttonFilter, time: 0 });
  await configurationMsg
  Btncollector.on("collect" ,async (int) => {
    if(int.customId === "newModalBtn") {
          let modalDAta
         if( int.isRepliable()) modalDAta= await int.showModal(fillterModal)
          const filter = (interaction) => interaction.customId === 'protectionFillter';
          let answers = await int.awaitModalSubmit({ filter, time: 0 })
          if( answers.isRepliable()) answers.reply({ephemeral : true , content : "submited"}).then(a =>setTimeout(() => {
            a.delete()
        }, 3000)).catch(e => null)
          await configurationMsg.edit({components:[]})
          data.fillterName =  answers.fields.getTextInputValue("fillter_name") 
          Number(answers.fields.getTextInputValue("fillter_limit")) ? data.fillterlimit = answers.fields.getTextInputValue("fillter_limit") : null
          resolve(data)
    }

  })

  })
  


}
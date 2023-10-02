const {Client , Message ,PermissionsBitField,Collection,TextInputBuilder , StringSelectMenuBuilder , StringSelectMenuOptionBuilder , ActionRowBuilder , EmbedBuilder, messageLink , ButtonBuilder , ButtonStyle , ModalBuilder, TextInputStyle,RoleSelectMenuBuilder} = require("discord.js")
const client = require('../../main')
let {guildsConfig,customCommands,coolDown} = client;
const config = require("../../config.json")
let langExample = require("../../language/ar.json");
const runningCmd = new Map()  
const membersRolesConfig = require("../../models/membersroles")
const protection = require("../../models/protection")

/**
 * 
 * @param {Client} client
 * @param {Message} message 
 * @param {String[]} args 
 * @param {langExample} language 
 * @param {Array} otherInfo 
 */



client.on("guildMemberAdd" , async (member) => {
/// get user data 
    let guildInfo = guildsConfig.find(d =>  d.guildId === member.guild.id);
    let languageName = guildInfo ? guildInfo.language : config.language;
    /**
     * @type {langExample}
     */
    let language = client.language[languageName];
    let userData = await membersRolesConfig.findOne({guildId : member.guild.id , memberID : member.id})
    if(!userData) return
    let acceptedRoles = []
    let rejectedRoles = []

    for (let index = 0; index < userData.protectionFilter.length; index++) {
        const protectionFilter = userData.protectionFilter[index];
        let protectionData = await protection.findOne({guildId : member.guild.id,fillterName : protectionFilter})
        if(protectionData) {
            if(protectionData.fillterlimit <= userData.lemit) {
                if(protectionData.JoinType === "auto") await returnMemberRoles(member , userData , protectionData ,rejectedRoles ,  acceptedRoles , membersRolesConfig)
                else if(protectionData.JoinType === "approval") {
                    if(protectionData?.approvalChannel) {
                        let approvalChannel = member.guild.channels.cache?.get(protectionData.approvalChannel)
                        if(approvalChannel) {
                            userData.protectionFilter.map(a => {

                            })
                            let aprrovalEmbed = new EmbedBuilder()
                            .setAuthor({name : member.user.username , iconURL : member.user.avatarURL()})
                            .setColor("#f8f8f8")
                            .setTitle(language.JoinEvent.aprrovalEmbed.title)
                            .addFields(
                                {name : "> " + language.JoinEvent.aprrovalEmbed.user,value: "```js\n\""+member.user.username + "#"+member.user.discriminator+"\"\n```",inline : true},
                                {name : "> " + language.JoinEvent.aprrovalEmbed.id,value: "```js\n\""+member.user.id+"\"\n```",inline : true},
                                {name : "> " + language.JoinEvent.aprrovalEmbed.roles,value: "```js\n\""+userData.roles.length+"\"\n```",inline : true},
                                {name : "> " + language.JoinEvent.aprrovalEmbed.fillters,value: "```js\n\""+`${protectionData.fillterName}`+"\"\n```",inline : true},
                                )
                            .setDescription()
                            .setFooter({text : member.guild.name , iconURL : member.guild.iconURL()})
                            .setTimestamp()

                            /// 
                            let acceptBtn = new ButtonBuilder()
                            .setCustomId("acceptBtn"+member.id)
                            .setEmoji("✔️")
                            .setStyle("Success")


                            let cancelBtn = new ButtonBuilder()
                            .setCustomId("rejectBtn"+member.id)
                            .setEmoji("✖")
                            .setStyle(ButtonStyle.Danger)
                            

                            let BtnsACtion = new ActionRowBuilder().addComponents(acceptBtn , cancelBtn)

                            ///
                            let approvalMsg = await approvalChannel.send({embeds : [aprrovalEmbed] , components : [BtnsACtion]}).catch(err => false)
                            if(approvalMsg) {
                                await membersRolesConfig.findOneAndUpdate({guildId : member.guild.id , memberID : member.id},
                                {
                                    approvalMsg : approvalMsg.id
                                },
                                {
                                    overwrite:false,
                                    upsert :true,
                                    new : true,
                                    setDefaultsOnInsert : true
                                }) 
                            }
                        }
                    }
                }       
            }
        }

    }
     
})





client.on("interactionCreate" , async (interaction) => {
    if(!interaction.isButton()) return
    if(!interaction.customId.startsWith("acceptBtn") || !interaction.customId.startsWith("rejectBtn")) return
    interaction.deferReply()
    let userData = await membersRolesConfig.findOne({approvalMsg : interaction.message.id})
    if(!userData) return
    let approvalMsg = await interaction.channel.messages.cache.get(userData.approvalMsg)
    if(!approvalMsg) return
    if(interaction.customId.startsWith("acceptBtn") )  {
        
    } else if( interaction.customId.startsWith("rejectBtn")) {

    }
})

async function returnMemberRoles(member , userData , protectionData ,rejectedRoles ,  acceptedRoles , membersRolesConfig) {
    for (let index = 0; index < userData.roles.length; index++) {
        const Role = userData.roles[index].roleID;
        if(protectionData.fillterType === "Roles") {
            if(protectionData.roles.hasOwnProperty(Role)) rejectedRoles.push(Role )
            else acceptedRoles.push(Role)
        } else if(protectionData.fillterType === "Permissions") {
            for (let index = 0; index < protectionData.permissions.length; index++) {
                const permission = protectionData.permissions[index];
                if(member.guild.roles.cache.get(Role).permissions.has(permission))  rejectedRoles.push(Role)
                else acceptedRoles.push(Role)
            }
        }
    }

    for (let index = 0; index < acceptedRoles.length; index++) {
        const role = acceptedRoles[index];
        let rolePosition = await member.guild.roles.cache.get(role).rawPosition
        if(rolePosition >= member.guild.members.me.roles.highest.position)  rejectedRoles.push(role)
        else  await  member.roles.add(role,"Auto Join back up role").catch(err => rejectedRoles.push(role))
    
    }


await membersRolesConfig.findOneAndUpdate({guildId : member.guild.id , memberID : member.id},
    {
        lemit : userData.lemit ++,
        rejectedRoles : [...new Set(userData.rejectedRoles.concat(rejectedRoles))]
    },
    {
        overwrite:false,
        upsert :true,
        new : true,
        setDefaultsOnInsert : true
    }).catch(err => null) 
}
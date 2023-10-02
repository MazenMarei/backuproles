const Discord = require('discord.js');
const client = require('../../main')
let {guildsConfig,customCommands,coolDown} = client;
const config = require("../../config.json")
let langExample = require("../../language/ar.json");
let BackupDataConfig = require("../../models/membersroles")
client.on("guildMemberUpdate" , async (oldmember , newmember) => {
    if(newmember.roles.cache.size > oldmember.roles.cache.size || newmember.roles.cache.size < oldmember.roles.cache.size  ) {
        let Roles = newmember.roles.cache.map((role)=> ({
            roleID : role.id,
            roleName : role.name,
            roleColor : role.color,
            rawPosition : role.rawPosition,
            permissions : role.permissions,
        }))
        let backupData =  await BackupDataConfig.findOneAndUpdate(
            {guildId : newmember.guild.id , memberID : newmember.id} ,
             {roles : Roles} , 
             {
                overwrite:false,
                upsert :true,
                new : true,
                setDefaultsOnInsert : true
        })
    }     







})
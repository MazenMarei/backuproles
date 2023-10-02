const Discord = require('discord.js');
const {getCommand} = require("../Functions/loadcommands")
const client = require('../../main');
const config = require("../../config.json");
let langExample = require("../../language/ar.json");
let {guildsConfig,customCommands,coolDown} = client
const runningCmd = new Map()  

/**
 * @param {Discord.Client} client 
 * @param {client.} client 
 */

    client.on("messageCreate" , async message =>{
        if(!message.guild || !client.readyTouse) return  

        let guildInfo = guildsConfig.find(d =>  d.guildId === message.guildId);
 
        let prefix = guildInfo ? guildInfo?.prefix : config.prefix;
        let languageName = guildInfo ? guildInfo.language : config.language;
        /**
         * @type {langExample}
         */
        let language = client.language[languageName];
        if(message.author.bot || !message.guild || !message.content.startsWith(prefix)) return

        let args = message.content.trim().split(/ +/);
        let cmd = args[0].trim().toLowerCase().slice(prefix.length);
        
        let command = await client.commands.find(d => d.config?.aliases?.includes(cmd));
        if(!command) return
        let coolDownCheck = coolDown.find(d => d.commandName === command.config.name && d.memberID ===  message.member.id && d.guildId === message.guild.id && d.time > Date.now());
        if(coolDownCheck && !coolDownCheck.reply) return  message.reply({embeds:[new Discord.EmbedBuilder().setColor("#151d7a")
        .setDescription(`**_${language.events.coolDown}   \`${Math.ceil(Math.ceil(coolDownCheck.time - Date.now()) / 1000)}\` ${language.events.seconds}_**`)]}).then((msg) => {
         coolDownCheck.reply = true
      })
      else if(coolDownCheck && coolDownCheck.reply) return;
      let commandConfig = customCommands.find(d => d.guildId === message.guildId && d.commandName );

       await coolDown.set(`{${message.guild.id}}{${message.member.id}}-${command.config?.name}`, {
        commandName: command.config.name,
        memberID: message.member.id,
        reply: false,
        guildId: message.guild.id,
        time: Date.now() + (command.config.coolDown* 1000),

     })
     setTimeout(() => {  coolDown.delete(`{${message.guild.id}}{${message.member.id}}-${command.config?.name}`);}, command.config.coolDown* 1000);
        if(!commandConfig && !message.member.permissions.toArray().find(d => command.config?.permissions?.includes(d)) && command.config?.permissions?.length > 0 || commandConfig && !message.member.permissions.toArray().find(d => command.config?.permissions?.includes(d)) && !command.config?.permissions?.length > 0 && member.roles.cache.find(d => commandConfig?.roles?.includes(d.id))) return message.reply({embeds:[new Discord.EmbedBuilder().setColor("#151d7a")
        .setDescription(`**_${language.events.permission} \`${command.config?.permissions[0]}\`_**`)]});
         let member =  await message.member.fetch(true).catch((err) => null)
         let otherInfo = { 
            type: "messageCommand",
            prefix: prefix,
            language: languageName,
    }
   
       /// running command Error Embed <start>
       let runningCmdErrorEmbed = new Discord.EmbedBuilder()
       .setTitle(language.ticketSetup.errorEmbed.title)
       .setColor("Red")
       /// running command Error Embed <end>
     
       /// check if there is an already running command from the user <start>
       if(runningCmd?.get(message.author.id)?.running === command.config.name) {
         runningCmdErrorEmbed.setFields({name : `> ${language.ticketSetup.runningCmdErrorEmbed.error} : ` , value : language.ticketSetup.runningCmdErrorEmbed.value  +  runningCmd?.get(message.author.id)?.message_Link})
         return message.reply({embeds : [runningCmdErrorEmbed]})
       } 
       runningCmd.set(message.author.id , {running : command.config.name  })
       args.shift()
       await command.run(client,message,args,language,otherInfo , runningCmd)
    })
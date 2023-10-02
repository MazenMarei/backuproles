const Discord = require('discord.js');
const client = require('../../main')
let {guildsConfig,customCommands,coolDown} = client;
const config = require("../../config.json")
let langExample = require("../../language/ar.json");
const runningCmd = new Map()  

client.on("interactionCreate" , async i => {
      let interaction = i;
      if(!interaction.isCommand() || !client.readyTouse || !interaction.guild) return;
      await interaction.deferReply().catch((err) => null)
      interaction.reply = interaction.editReply;
      interaction.edit = interaction.editReply;
      interaction.author = interaction.user;
      

      let guildInfo = guildsConfig.find(d =>  d.guildId === interaction.guildId);
 
      let prefix = guildInfo ? guildInfo?.prefix : config.prefix;
      let languageName = guildInfo ? guildInfo.language : config.language;
      /**
       * @type {langExample}
       */
      let language = client.language[languageName]
     
      let args = [];
      args.push(interaction.commandName);
      let options_array = interaction.options._hoistedOptions
      if(interaction.options._subcommand) {
        args.push(interaction.options._subcommand)
      }
       for (let index = 0; index < options_array.length; index++) {
         const option = options_array[index].value
         if(typeof option !== String) args.push(option)
         else   option.trim().split(/ +/).map(d => args.push(d))
       }
      let cmd = args[0]?.toLowerCase().trim();
      let command = client.commands.get(cmd);
      if(!command) return;
       let coolDownCheck = coolDown.find(d => d.commandName === command.config.name && d.memberID ===  interaction.member.id && d.guildId === interaction.guild.id && d.time > Date.now());
       if(coolDownCheck && !coolDownCheck.reply) return  interaction.reply({ephemeral :true,embeds:[new Discord.EmbedBuilder().setColor("#151d7a")
        .setDescription(`**_${language.events.coolDown}   \`${Math.ceil(Math.ceil(coolDownCheck.time - Date.now()) / 1000)}\` ${language.events.seconds}_**`)]}).then((msg) => {
          coolDownCheck.reply = true
       })
       else if(coolDownCheck && coolDownCheck.reply) return;
       let commandConfig = customCommands.find(d => d.guildId === interaction.guildId && d.commandName );
       await coolDown.set(`{${interaction.guild.id}}{${interaction.member.id}}-${command.config?.name}`, {
        commandName: command.config.name,
        memberID: interaction.member.id,
        guildId: interaction.guild.id,
        reply: false,
        time: Date.now() + (command.config.coolDown* 1000),

     })
     if(!commandConfig && !interaction.member.permissions?.toArray().find(d => command.config?.permissions?.includes(d)) && command.config?.permissions?.length > 0 || commandConfig && !interaction.member.permissions.toArray().find(d => command.config?.permissions?.includes(d)) && !command.config?.permissions?.length > 0 && member.roles.cache.find(d => commandConfig.roles.includes(d.id))) return interaction.reply({embeds:[new Discord.EmbedBuilder().setColor("#151d7a")
     .setDescription(`**_${language.events.permission} \`${command.config?.permissions[0]}\`_**`)]});
     let otherInfo = { 
      type: "interactionCommand",
      prefix: prefix,
      language: languageName,
    }
           /// running command Error Embed <start>
           let runningCmdErrorEmbed = new Discord.EmbedBuilder()
           .setTitle(language.ticketSetup.errorEmbed.title)
           .setColor("Red")
           /// running command Error Embed <end>
         
           /// check if there is an already running command from the user <start>
           if(runningCmd?.get(interaction.author.id)?.running === command.config.name) {
             runningCmdErrorEmbed.setFields({name : `> ${language.ticketSetup.runningCmdErrorEmbed.error} : ` , value : language.ticketSetup.runningCmdErrorEmbed.value  +  runningCmd?.get(interaction.author.id)?.message_Link})
             return interaction.reply({embeds : [runningCmdErrorEmbed]})
           } 
           runningCmd.set(interaction.author.id , {running : command.config.name  })
           if (!interaction.isRepliable()) return
           args.shift()
           await command.run(client,interaction,args,language,otherInfo , runningCmd)
          //  if(interaction.isStringSelectMenu())
      })



const Discord = require('discord.js');
let guildConfig = require("../../models/guildConfig")
let client = require('../../main');
const { createSlashCommand } = require('../Functions/creatslashcommands');
const {rolebackupready} = require("../Functions/rolebackupready")
const mongoose = require('mongoose');
const dbConnection = mongoose.connection;


client.on('ready', async () => {
 
  let allGuildsData = await guildConfig.find();
  await allGuildsData.map((guildData) => {
    client.guildsConfig.set(guildData.guildId,{
        guildId: guildData.guildId,
        prefix: guildData.prefix,
        language: guildData.language
    })

  });

  await createSlashCommand(client);
  await rolebackupready(client)
  setTimeout(() => {
    client.readyTouse = true;
  }, 2000);
  console.log("ready")
})


dbConnection.on("open" , () => {
  console.log("connected");
})
const Discord = require("discord.js")
var numeral = require('numeral');
const {REST} = require("@discordjs/rest")
const {Routes} = require('discord-api-types/v10')
const Partials = Discord.Partials
const Intents = Object.keys(Discord.IntentsBitField.Flags).slice(19,40)
const Config = require("./config.json")
const {loadCommands} = require("./src/Functions/loadcommands")
const {createSlashCommand} =require("./src/Functions/creatslashcommands")
const {loadLanguage} = require("./src/Functions/loadLanguage")
const cliSpinners = require('cli-spinners');
const mongoose = require("mongoose")
const {loadEvents} = require("./src/Functions/loadEvents")
const fs = require("fs")

const client = new Discord.Client({
    partials: [
            Partials.Channel , Partials.GuildMember , Partials.GuildScheduledEvent ,
            Partials.Message , Partials.Reaction , Partials.ThreadMember, Partials.User
            ],
    failIfNotExists: false,
    intents:    Intents 
});
client.guildsConfig = new Discord.Collection();
client.commands = new Discord.Collection();
client.coolDown = new Discord.Collection();
client.language = {};
client.embedColor = Config.embedColor;
client.readyTouse = false;
client.customCommands = new Discord.Collection();
client.slashCommands = new Discord.Collection();
client.rolesBackup = new Discord.Collection()
client.members = new Discord.Collection();
module.exports = client;
loadCommands(client);
loadLanguage(client);
loadEvents(client);
mongoose.connect(Config.Mongoose, 
    {
    useNewUrlParser: true, 
    useUnifiedTopology: true
})
client.login(Config.Token)
// login to discord and mongoose <end>

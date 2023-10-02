const Discord = require('discord.js');
const fs = require("fs")

/**
 * @param {Discord.Client} client 
 */

function loadLanguage(client) {
    fs.readdir("language" , (error , langFiles) => {
    
            for ( let file of langFiles )   {
            
                if(file.endsWith(".json")) {
                if (!file.split('.').pop() === 'json') return console.log(file.split('.').pop() === 'json')
                    let fileRequire = require("../../language/" +file)
            
                    client.language[file.split(".")[0]] =  fileRequire
                
                }
            }
        })
}


module.exports = {loadLanguage}


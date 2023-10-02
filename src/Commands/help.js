const {Client , Message, PermissionFlagsBits, PermissionOverwrites, PermissionsBitField} = require("discord.js")
const pkg =require("getmac").default 
/**
 * 
 * @param {Client} client 
 * @param {Message} message 
 * @param {String[]} args 
 * @param {*} otherInfo 
 */


module.exports.run = (client , message, args ) => {

//// working on it
}



module.exports.config = {
            module : [{name : "Client , Message" , module : "discord.js"} , {name : "pkg" , module : "getmac"}],
            name:"help",
            aliases : ["h"  , "مساعدة"],
            coolDown : 10,
            permissions:  new PermissionsBitField("Administrator").toArray(),
            name_localizations:{
              "fr" : "aider"
            },
            description:"Getting help.",
            "description_localizations" : {
              "fr" : "Obtenir de l’aide"
            },
            options : [
              {
              type : 3,
              name	:"command",
              name_localizations:{
                "fr" : "commander"
              },	
              description	: "The command you want to be get help with." , 
              description_localizations: {
                "fr" : "La commande pour laquelle vous souhaitez obtenir de l’aide."
              },
              required : false ,
              choices: [{name : "ban" , value : "ban"}],
            }
          ],
          Usage : {
            ar : "للمساعدة"
          }
            
  }



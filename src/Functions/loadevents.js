const Discord = require('discord.js');
const fs = require("fs")
let Files = {"" : []}

/**
 * @param {Discord.Client} client 
 */

function loadEvents(client) {
    fs.readdir("src/Events" , (error , eventsFiles) => {
        if (error) return console.log(error)
              //-------get folders inside Event folder and Js files------------------------\\
            for ( let file of eventsFiles )   {
                if(!file.split(".")[1]) {
                    Files[file]= []
                    //---------add js file from sub folders------------\\
                    let subFiles = fs.readdirSync("src/Events/"+file).filter(f => f.split('.').pop() === 'js');
                    if (subFiles.length > 0)  Files[file]= subFiles
                    for (let x in subFiles) {
                        let subJsFile = subFiles[x]
                        let JsFile = require("../Events/"+file+"/"+subJsFile)
                
                    }
                }else {
                //---------add js file from command folder------------\\
                    if (!file.split('.').pop() === 'js') return
                    Files[""] = file
                        let JsFile = require("../Events/" +file)
                    
                }
            }
        })
}


module.exports = {loadEvents}


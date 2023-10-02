const fs = require("fs")
let Files = {"" : []}
 function loadCommands(client) {
    fs.readdir("src/Commands/",  (error , commandFiles ) => { 
        if (error) return console.log(error)
        //-------get folders inside command folder and Js files------------------------\\
        for ( let file of commandFiles )   {
            if(!file.split(".")[1]) {
                Files[file]= []
                //---------add js file from sub folders------------\\
                let subFiles = fs.readdirSync("src/Commands/"+file).filter(f => f.split('.').pop() === 'js');
                if (subFiles.length > 0)  Files[file]= subFiles
                for (let x in subFiles) {
                    let subJsFile = subFiles[x]
                    let JsFile = require("../Commands/"+file+"/" +subJsFile)
                    JsFile.config.aliases.push(JsFile.config.name )
                    client.commands.set (JsFile.config.name , JsFile)
                }
            }else {
            //---------add js file from command folder------------\\
                if (!file.split('.').pop() === 'js') return
                Files[""] = file
                    let JsFile = require("../Commands/" +file)
                    JsFile.config.aliases.push(JsFile.config.name )
                    client.commands.set (JsFile.config.name, JsFile)
            }
        }
        client.commandsObject = Files
        console.log("load commands files")
    })
    }
    

    function getCommand(client , cmd)  {
        let commands = client.commands.keys()
            for (let key of commands) {
                if(key.includes(cmd)) return {data : client.commands.get(key) , res : true}
            }
            return {data : null , res : false}
    }
    module.exports = { 
        getCommand , 
        loadCommands
    }
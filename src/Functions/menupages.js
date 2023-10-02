const {Client , Message ,PermissionsBitField,Collection,TextInputBuilder , StringSelectMenuBuilder , StringSelectMenuOptionBuilder , ActionRowBuilder , EmbedBuilder, messageLink , ButtonBuilder , ButtonStyle , ModalBuilder, TextInputStyle} = require("discord.js")
/**
 * 
 * @param {Client} client
 * @param {Message} message 
 * @param {String[]} args 
 * @param {langExample} language 
 * @param {Array} otherInfo 
 */



function pageCreator(data , pageLimit ) {

    let pagesList = []
    let pagesCount = Math.ceil(data.length / pageLimit)
    let index = 0
    let pagearry = []
    for (let page = 0 ; page < pagesCount ; page ++) 
    {
      for (let i = 0 ; i < pageLimit ; i++) {
        if(index < data.length) {
            pagearry.push(data[index])
            index ++
        }
      }
      pagesList.push(pagearry)
      pagearry = []
    }
  return pagesList
  }



async function menuCreate(  pages , message , MenuPlaceholder , language , values = {MinValues : 1 , MaxValues : 25 } ,save ) {
const {Client , Message ,PermissionsBitField,Modal,TextInputBuilder , StringSelectMenuBuilder , StringSelectMenuOptionBuilder , ActionRowBuilder , EmbedBuilder, messageLink , ButtonBuilder , ButtonStyle , ModalBuilder} = require("discord.js")

    //// create page change's buttons <start>

    //////
    let nextButton = new ButtonBuilder()
    .setCustomId("nextButton" + message.id)
    .setStyle(ButtonStyle.Primary)
    .setEmoji("➡")

    ////
    let previousButton = new ButtonBuilder()
    .setCustomId("previousButton"+message.id)
    .setStyle(ButtonStyle.Primary)
    .setEmoji("⬅")


    ////
    let saveBtn = new ButtonBuilder()
    .setCustomId("saveBtn"+message.id)
    .setEmoji("✔️")
    .setStyle("Success")

    /////

    let cancelBtn = new ButtonBuilder()
    .setCustomId("cancelBtn"+message.id)
    .setEmoji("✖")
    .setStyle(ButtonStyle.Danger)


    ////
    pages =  pageCreator(pages , 25)
    let buttonsRow;
    if (pages.length > 1)  {
        if(save) buttonsRow = new ActionRowBuilder().addComponents(previousButton,cancelBtn,saveBtn,nextButton)
        else buttonsRow = new ActionRowBuilder().addComponents(previousButton,cancelBtn,nextButton)
    } else if(save) {
        buttonsRow = new ActionRowBuilder().addComponents(cancelBtn,saveBtn)
    } else {
        buttonsRow = new ActionRowBuilder().addComponents(cancelBtn)

    }
    //// create page change's buttons <end>

    /// create menu <start>

        /// create pages array 
    let currentPage = 0
    let MaxValues = pages[currentPage].length > values.MaxValues?values.MaxValues:pages[currentPage].length
    let Menu = new StringSelectMenuBuilder()
    .setCustomId("pages'Menu"+message.id)
    .setMaxValues(MaxValues)
    .setMinValues(values.MinValues)
    .setPlaceholder(MenuPlaceholder);

    pages[0]?.map(a => {
        Menu.addOptions ({
            label : a?.label?a?.label:undefined,
            value : a?.value?a?.value:undefined,
            description : a?.Description?a?.Description:undefined,
            emoji : a?.Emoji?a?.Emoji:undefined
        })
    })
    let channelsRow = new ActionRowBuilder().addComponents(Menu)
    /// create menu <end>

    /// creat collector <start>
    let menuResponseMsg;
    if(buttonsRow) menuResponseMsg = await message.edit({ components : [channelsRow , buttonsRow]})
    else menuResponseMsg = await message.edit({ components : [channelsRow ]})
    const buttonFilter =  i => i.user.id === message.author.id && ["nextButton" + message.id , "previousButton" + message.id , "saveBtn"+message.id , "cancelBtn"+message.id].includes(i.customId) && i.message.id ===  menuResponseMsg.id;
    const menuFilter = i => i.user.id === message.author.id && i.customId === "pages'Menu"+message.id && i.message.id ===  menuResponseMsg.id;

    const Btncollector = menuResponseMsg.createMessageComponentCollector({ buttonFilter, time: 0 });
    
    let menuValues = []


    Btncollector.on("collect", async (btnin) => {
       switch (btnin.customId) {
        case "nextButton" + message.id:
            currentPage ++
            if(currentPage > pages.length -1 ) currentPage = 0
            if(save) buttonsRow = new ActionRowBuilder().addComponents(previousButton,cancelBtn,saveBtn,nextButton)
            else buttonsRow = new ActionRowBuilder().addComponents(previousButton,cancelBtn,nextButton)
            if(btnin.isRepliable()) btnin.reply({ephemeral : true , content :language.menupages.nextpage   }).then(a =>setTimeout(() => {
                a.delete()
            }, 3000)).catch(()=> null)
            Menu.setOptions()
            Menu.setMaxValues(pages[currentPage].length)
            pages[currentPage]?.map(a => {
                try {
                                 Menu.addOptions ({
                    label : a?.label?a?.label:undefined,
                    value : a?.value?a?.value:undefined,
                    Description : a?.Description?a?.Description:undefined,
                    emoji : a?.Emoji?a?.Emoji:undefined,
                    default : menuValues[currentPage].find(b => b == a?.value)?true:false
                })
                
                } catch (error) {
                    console.log("err");
                }

            })

            await message.edit({components : [channelsRow , buttonsRow]}).catch(err =>null)
            break;
       
        case "previousButton" + message.id:
            currentPage --
            if(currentPage < 0) currentPage = pages.length -1
            if(save) buttonsRow = new ActionRowBuilder().addComponents(previousButton,cancelBtn,saveBtn,nextButton)
            else buttonsRow = new ActionRowBuilder().addComponents(previousButton,cancelBtn,nextButton)
            if(btnin.isRepliable())btnin.reply({ephemeral : true , content : language.menupages.previouspage}).then(a =>setTimeout(() => {
                a.delete()
            }, 3000)).catch(()=> null)
            Menu.setOptions()            
            Menu.setMaxValues(pages[currentPage].length)
            pages[currentPage ]?.map(a => {
                Menu.addOptions ({
                    label : a?.label?a?.label:undefined,
                    value : a?.value?a?.value:undefined,
                    description : a?.Description?a?.Description:undefined,
                    emoji : a?.Emoji?a?.Emoji:undefined,
                    default : menuValues[currentPage].find(b => b == a?.value)?true:false

                })
            })

                  await message.edit({components : [channelsRow , buttonsRow]})
            break;



       }
    })
    for (let index = 0; index < pages.length; index++) {
        menuValues.push([])
    }
    if(save)    {
        const Menucollector = menuResponseMsg.createMessageComponentCollector({ menuFilter, time: 0 });
        Menucollector.on("collect", async (menuin) => {
            if(menuin.customId === "pages'Menu"+message.id){
           if(menuin.isRepliable()){ 
            menuin.reply({ephemeral : true , content : language.menupages.menuvalueselected.replace("[value]", menuin?.values[0]) }).then(a =>setTimeout(() => {
                a.delete()
            }, 3000)).catch(()=> null)
            /// get the removed data 
            let newdata = []
            menuValues[currentPage].map((first) => {
                let found = false
                menuin.values.map(sec => {
                if(first === sec) {
                    found = true
                    newdata.push(sec)
                    } })})
                /// get new data

                menuin.values.map((first) => {
                    let found = false
                    menuValues[currentPage].map(sec => {if(first === sec) found = true})
                    if(!found)   newdata.push(first)})
            menuValues[currentPage] =  newdata
             
        }
        }

})
return new Promise( async (resolve, reject) => { 
    Btncollector.on("collect", async (btnin) => {
    switch (btnin.customId) {
     case "saveBtn" + message.id:
        let dataSubmeted = false
        menuValues.map(a => {
            if(a.length > 0) dataSubmeted = true
        })
        if(!dataSubmeted) return btnin.reply({ephemeral : true , content :language.menupages.noSubmetd   }).then(a =>setTimeout(() => {
            a.delete()
        }, 6000)).catch(()=> null)
        btnin.reply({ephemeral : true , content :language.menupages.saved   }).then(a =>setTimeout(() => {
            a.delete()
        }, 3000)).catch(()=> null)
        Menucollector.stop()
        Btncollector.stop()
        resolve({values : menuValues , Menucollector : Menucollector , Btncollector : Btncollector})
        break;

        case "cancelBtn"+message.id:
            btnin.reply({ephemeral : true , content :language.menupages.canceld   }).then(a =>setTimeout(() => {
                a.delete()
            }, 3000)).catch(()=> null)
            Menucollector.stop()
            Btncollector.stop()
            resolve({canceled : true})
            break;
    }
})
})


    } else {
            return new Promise( async (resolve, reject) => {
                Btncollector.on("collect", async (btnin) => {
                    switch (btnin.customId) {
                     case "cancelBtn"+message.id:
                        btnin.reply({ephemeral : true , content :language.menupages.canceld   }).then(a =>setTimeout(() => {
                            a.delete()
                        }, 3000)).catch(()=> null)
                        Menucollector.stop()
                        Btncollector.stop()
                        resolve({canceled : true})
                        break;
                    }
                })

                const Menucollector = menuResponseMsg.createMessageComponentCollector({ menuFilter, time: 0 });
                Menucollector.on("collect", async (menuin) => {
                    if(menuin.customId === "pages'Menu"+message.id){
                   if(menuin.isRepliable()){ 
                    menuin.reply({ephemeral : true , content : language.menupages.menuvalueselected.replace("[value]", menuin?.values[0]) }).then(a =>setTimeout(() => {
                        a.delete()
                    }, 3000)).catch(()=> null)
                    /// get the removed data 
                    let newdata = []
                    menuValues[currentPage].map((first) => {
                        let found = false
                        menuin.values.map(sec => {
                        if(first === sec) {
                            found = true
                            newdata.push(sec)
                            } })})
                        /// get new data
    
                        menuin.values.map((first) => {
                            let found = false
                            menuValues[currentPage].map(sec => {if(first === sec) found = true})
                            if(!found)   newdata.push(first)})
                    menuValues[currentPage] =  newdata
                    Menucollector.stop()
                    Btncollector.stop()
                        resolve({values : menuValues , Menucollector : Menucollector , Btncollector : Btncollector})
                     
                }
                }
    
        })
    })
    }



    /// creat collector <end>



}


module.exports = {
    menuCreate
}
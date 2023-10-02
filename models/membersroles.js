const mongoose = require('mongoose');
const config = require("../config.json")
const backupConfig = new mongoose.Schema({
    guildId: {
      required: true,
      type: String,
    },
     lemit : {
      type : Number,
      default : 0
     },
     protectionFilter : {
      type : Array,
      default :[] 
     },
     memberID : {
      type : String
     },
     roles : {
        type : Array
     },
     rejectedRoles : {
      type : Array
     },
     approvalMsg : {
      type : String
     }
    
}, { timestamps: { createdAt: 'Created at' }});

module.exports = mongoose.model('membersRolesBackupConfig', backupConfig);
const mongoose = require('mongoose');
const config = require("../config.json")
const protection = new mongoose.Schema({
    guildId: {
      required: true,
      type: String,
    },
    
        fillterName : String,
        fillterlimit : Number,
        fillterType : String,
        roles : [],
        permissions : [],
        users : [],
        JoinType : {
          type : String,
          default : "auto"
        },
        approvalChannel : {
          type : String
        },
    
},
 { timestamps: 
  { createdAt: 'Created at' }
});

module.exports = mongoose.model('protection', protection);
const mongoose = require('mongoose');
const config = require("../config.json")
const guildConfig = new mongoose.Schema({
    guildId: {
      required: true,
      type: String,
    },
    prefix: {
       type: String,
       default: config.prefix
    },
    language: {
        type: String,
        default: config.language
     },

    
}, { timestamps: { createdAt: 'Created at' }});

module.exports = mongoose.model('guildConfig', guildConfig);
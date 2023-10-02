const mongoose = require('mongoose');

const modelData = new mongoose.Schema({});

module.exports = mongoose.model('modelName', modelData);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var channelSchema = new Schema({
    number: Number,
	timestamp: Date,
    name: String,
    current: String,
    fav: Boolean
});

module.exports = mongoose.model('Channel', channelSchema);

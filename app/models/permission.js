const mongoose = require('mongoose');

const Permission = new mongoose.Schema({
    name: {type: String, required: true},
    label: {type: String, required: true}
},{
    timestamps: true
});


module.exports = mongoose.model('Permission', Permission);
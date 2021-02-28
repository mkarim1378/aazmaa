const mongoose = require('mongoose');
const Permission = require('./permission');

const Role = new mongoose.Schema({
    name: {type: String, required: true},
    permissions: [{type: mongoose.Types.ObjectId, ref:'Permission',required: true}],
    label: {type: String, default: ''}
});

module.exports = mongoose.model('Role', Role);

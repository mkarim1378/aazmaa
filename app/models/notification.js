const mongoose = require('mongoose');

const Notification = new mongoose.Schema({
    title: {type: String, required: true},
    body: [{type: String, required: true}],
    date: {type: String, required: true},
    file: {type: String, default: ''},
    classId: {type: mongoose.Types.ObjectId, ref: 'Class', default: null},
    slug: {type: String, required: true}
});


module.exports = mongoose.model('Notification', Notification);
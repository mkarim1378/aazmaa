const mongoose = require('mongoose');

const Practice = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: [String], default: ''},
    classId: {type: mongoose.Types.ObjectId, ref: 'Class'},
    file: {type: String, default: ''},
    deadlineDate: {type: String, default: ''},
    deadlineTime: {type: String, default: ''},
    slug: {type: String, default: ''}
});



module.exports = mongoose.model('Practice', Practice);
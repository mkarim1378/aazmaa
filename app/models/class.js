const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const ClassSchema = new mongoose.Schema({
    title: {type: String, required: true},
    teacher: {type: ObjectId, ref: 'User', required: true},
    capacity: {type: Number, required: true},
    description: {type: String, default: ''},
    students: {type: [ObjectId], default: []},
    place: {type: String, required: true},
    educationYear: {type: String, default: ''},
    term: {type: String, default: ''},
    month: {type: String, default: ''},
    year: {type: String, default: ''},
    image: {type: String, default: ''},
    code: {type: String, default: ''}
});



module.exports = mongoose.model('Class', ClassSchema);
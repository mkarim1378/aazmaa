const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const StudentSchema = new mongoose.Schema({
    studentId: {type: String, default: ''},
    name: {type: String, required: true},
    family: {type: String, required: true},
    email: {type: String, required: true},
    chatId: {type: String, required: true},
    nationalCode: {type: String, required: true},
    
}, {
    toJSON: {virtuals: true},
    timestamps: {createdAt: true}
});

StudentSchema.virtual('answers', {
    ref: 'Answer',
    localField: '_id',
    foreignField: 'student'
});

module.exports = mongoose.model('Student', StudentSchema);
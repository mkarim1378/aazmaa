const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const AnswerSchema = new mongoose.Schema({
    question: {type: ObjectId, ref: 'Question', default: null},
    practice: {type: ObjectId, ref: 'Practice', default: null},
    answer: {type: String, default: ''},
    media: {type: String, default: ''},
    student: {type: ObjectId, ref: 'User', required: true},
    exam: {type: ObjectId, ref: 'Exam', default: null},
    status: {type: Boolean, default: null},
    corrected: {type: Boolean, default: false},
    grade: {type: String, default: ''}
});

module.exports = mongoose.model('Answer', AnswerSchema);


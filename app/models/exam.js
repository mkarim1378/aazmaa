const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const ObjectId = mongoose.Types.ObjectId;

const ExamSchema = new mongoose.Schema({
    title: {type: String, required: true},
    level: {type: [String], required: true},
    teacher: {type: ObjectId, ref: 'Exam', required: true},
    finished: {type: Boolean, default: false},
    time1: {type: String, require: true},
    date1: {type: String, required: true},
    time2: {type: String, require: true},
    date2: {type: String, required: true},
    code: {type: String, default: ''},
    totalGrade: {type: String, default: ''},
    canceled: {type: Boolean, default: false}
}, {
    timestamps: {createdAt: true},
    toJSON: {virtuals: true}
});

ExamSchema.virtual('questions', {
    ref: 'Question',
    localField: '_id',
    foreignField: 'exam'
});

ExamSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Exam', ExamSchema);;





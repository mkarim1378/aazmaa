const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const mongoosePaginate = require('mongoose-paginate');

const QuestionSchema = new mongoose.Schema({
    question: {type: [String], required: true},
    media: {type: String, default: ''},
    options: [String],
    questionType: {type: String, required: true},
    mediaType: {type: String, required: true},
    teacher: {type: ObjectId, ref: 'User'},
    html: {type: String, default: ''},
    answerTypes: {type: [String], required: true},
    grade: {type: String, default: ''},
    categories: [{type: mongoose.Types.ObjectId, ref: 'Category', required: true}]
}, {
    timestamps: true,
    toJSON: {virtuals: true}
});

QuestionSchema.virtual('answers', {
    ref: 'Answer',
    localField: '_id',
    foreignField: 'question'
});
QuestionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Question', QuestionSchema);
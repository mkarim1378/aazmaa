const mongoose = require('mongoose');
const ObjetcId = mongoose.Types.ObjectId;

const exam_question = new mongoose.Schema({
    exam: {type: ObjetcId, ref: 'Exam', required: true},
    question: {type: ObjetcId, ref: 'Question'}
},{
    timestamps: true
});

const model = mongoose.model('exam_question', exam_question);

module.exports.model = model;

module.exports.getAllExamsForSingleQuestion = async function(questionId){
    let examQuestion = await model.find({question: questionId}).populate(['exam']);
    return examQuestion.map(item => item.exam).filter(item => item != null);
}

module.exports.getAllQuestionsForSingleExam = async function(examId, studentId){
    let examQuestion = await model.find({exam: examId}).populate([
        {
            path: 'question',
            populate: [
                {
                    path: 'categories'
                },
                {
                    path: 'answers',
                    match: {
                        student: studentId
                    }
                }
            ]
        }

    ]);
    
    return examQuestion.map(item => item.question).filter(item => item != null);
}

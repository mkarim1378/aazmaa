const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const exam_classSchema = new mongoose.Schema({
    exam: {type: ObjectId, ref: 'Exam', required: true},
    classId: {type: ObjectId, ref: 'Class', required: true}
});



const model = mongoose.model('exam_class', exam_classSchema);
module.exports.model = model;

module.exports.getAllExamsForSingleClass = async function(classId){
    let examClass = await model.find({classId}).populate(['exam']);
    let array = examClass.map(item => item.exam).filter(item => item != null);
    return array;
}

module.exports.getAllClassesForSingleExam = async function(examId){
    let examClass = await model.find({exam: examId}).populate(['classId']);
    let array = examClass.map(item => item.classId).filter(item => item != null);
    return array;
}


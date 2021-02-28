const mongoose = require('mongoose');
const student = require('../student');
const ObjectId = mongoose.Types.ObjectId;

const student_examSchema = new mongoose.Schema({
    student: {type: ObjectId, ref: 'User'},
    exam: {type: ObjectId, ref: 'Exam'},
    grade: {type: String, default: ''}
});

let student_examModel = mongoose.model('student_exam', student_examSchema);



module.exports.isStudentInExam = async function(studentId, examId){
    let exams = await module.exports.getAllExamsForSingleStudent(studentId);
    exams = exams.map(exam => exam._id.toString());
    return exams.includes(examId.toString());
}

module.exports.getAllExamsForSingleStudent = async function(studentId){
    let array = await student_examModel.find({student: studentId}).populate(['student', 'exam']);
    
    if(array.length > 0){
        return array.filter(item => (item.student != null) && (item.exam != null)).map(item => item.exam);
    }
    return [];
}
module.exports.getAllStudentsForSingleExam = async function(examId){
    let array = await student_examModel.find({exam: examId}).populate([
        {
            path: 'student',
            populate:{
                path: 'answers',
                match: {
                    exam: examId
                }
            }
        }
    ]);
    
    return array.map(item => item.student).filter(item => item != null);
}
module.exports.studentCountForSingleExam = async function(examId){
    let collection = await student_examModel.find({});
    let students = [];
    let length = 0;
    collection.forEach(item => {
        if(item.exam == examId){
            students.push(item.student);
            length++;
        }
    });
    return length;
}

module.exports.examCountForSingleStudent = async function(studentId){
    student_examModel.find({});
    let exames = [];
    let length = 0;
    collection.forEach(item => {
        if(item.student == studentId){
            exames.push(item.exam);
            length++;
        }
    });
    return length;
}

module.exports.model = student_examModel;
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const ObjectId = mongoose.Types.ObjectId;

const teacher_examSchema = new mongoose.Schema({
    teacher: {type: ObjectId, ref: 'User', required: true},
    exam: {type: ObjectId, ref: 'Exam', required: true}
});

teacher_examSchema.plugin(mongoosePaginate);
let model = mongoose.model('teacher_exam', teacher_examSchema);
module.exports.model = model;

module.exports.getExamsForSingleTeacher = async function(teacherId, query, page){
    try{
        let teacherExam = [];
        let array = [];
        if(teacherId){
            teacherExam = await model.find({teacher: teacherId}).populate(['exam']);
        }else{
            return [];
        }
        
        if(typeof teacherExam.map === 'function'){
            array = teacherExam.map(item => item.exam).filter(item => item != null);;
        }else{
            array = teacherExam.docs.map(item => item.exam).filter(item => item != null);;
        }
        
        return array;
    }catch(ex){
        console.log(ex);
        return [];
    }
}

module.exports.getTeachersForSingleExam = async function(examId){
    let student_exam = await model.find({exam: examId}).populate(['teacher']);
    return student_exam.map(item => item.teacher).filter(item => item.teacher != null);
}


const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const teacher_classSchema = new mongoose.Schema({
    teacher: {type: ObjectId, ref: 'User', required: true},
    classId: {type: ObjectId, ref: 'Class', required: true}
});

let model = mongoose.model('teacher_class', teacher_classSchema);
module.exports.model = model;

module.exports.getClassesForSingleTeacher = async function(teacherId){
    let student_class = await model.find({teacher: teacherId}).populate(['classId']);
    return student_class.map(item => item.classId).filter(item => (item != null));
}

module.exports.getTeachersForSingleClass = async function(classId){
    let student_class = await model.find({classId}).populate(['teacher']);
    return student_class.map(item => item.teacher).filter(item => item != null);
}


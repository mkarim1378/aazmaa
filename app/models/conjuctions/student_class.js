const mongoose = require('mongoose');
const student = require('../student');
const ObjectId = mongoose.Types.ObjectId;

const student_classSchema = new mongoose.Schema({
    student: {type: ObjectId, ref: 'User'},
    classId: {type: ObjectId, ref: 'Class'}
});

let student_classModel = mongoose.model('student_class', student_classSchema);



module.exports.isStudentInClass = async function(studentId, classId){
    let classes = await module.exports.getAllClassesForSingleStudent(studentId);
    
    classes = classes.map(_class => _class._id);
    
    return classes.find(item => item == classId);
}
module.exports.getAllClassesForSingleStudent = async function(studentId){
    let array = await student_classModel.find({student: studentId}).populate(['student', 'classId']);
    
    if(array.length > 0){
        return array.filter(item => (item.student != null) && (item.classId != null)).map(item => item.classId);
    }
    return [];
}
module.exports.getAllStudentsForSingleClass = async function(classId){
    let array = await student_classModel.find({classId}).populate(['student', 'classId']);
    
    return array.filter(item => (item.student != null) && (item.classId != null)).map(item => item.student);
}
module.exports.studentCountForSingleClass = async function(classId){
    let collection = await student_classModel.find({});
    let students = [];
    let length = 0;
    collection.forEach(item => {
        if(item.classId == classId){
            students.push(item.student);
            length++;
        }
    });
    return length;
}

module.exports.classCountForSingleStudent = async function(studentId){
    student_classModel.find({});
    let classes = [];
    let length = 0;
    collection.forEach(item => {
        if(item.student == studentId){
            classes.push(item.classId);
            length++;
        }
    });
    return length;
}

module.exports.model = student_classModel;
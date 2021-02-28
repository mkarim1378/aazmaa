const Controller = require('./controller');
const Student = require('../../models/student');

class StudentController extends Controller{
    async panelStudentList(req, res, next){
        let students = null;
        try{ 
            students = await Student.find({});
            return res.render('student/studentList', {
                students,
                path: 'students'
            })
        }catch(ex){
            req.flash('errors', 'مشکلی در یافتن دانشجویان رخ داد');
            return this.back(req, res);
        }
    }
}


module.exports = new StudentController();
const Controller = require('./controller');
const canAccess = require('../middlewares/canAccess');
const Exam = require('../../models/exam');
const User = require('../../models/user')
const teacher_exam = require('./../../models/conjuctions/teacher_exam');
const Question = require('../../models/question');
const helper = require('./../../helper/helperFunctions');

class HomeController extends Controller{
    
    async index(req, res, next){
        let exams = [];
        let questions = [];
        
        if(req.user.type == 'teacher' || req.user.isAdmin){
            exams = await teacher_exam.getExamsForSingleTeacher(req.user._id);
            questions = await Question.find({teacher: req.user._id});
        }
        let futureExams = exams.filter(async exam => {
            let started = await helper.isExamStarted(exam._id);
            let ended = await helper.isExamEnded(exam._id);
            console.log('started: ', started);
            console.log('ended: ', ended);
            if(!started && !ended){
                return true;
            }
            return false;
        });
        console.log(futureExams);
        
        res.render('home', {
            exams,
            questions,
            path: 'home',
            errors: req.flash('errors'),
            success: req.flash('success'),
            futureExams
        });
    }
}


module.exports = new HomeController();
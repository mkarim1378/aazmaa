const Controller = require('./controller');
const Answer = require('../../models/answer');
const Question = require('../../models/question');
const Exam = require('../../models/exam');
const fs = require('fs');
const exam_question = require('../../models/conjuctions/exam_question');
const User = require('../../models/user');
const moment = require('moment-jalaali');
const mkdirp = require('mkdirp');
const helper = require('../../helper/helperFunctions');
const student_exam = require('../../models/conjuctions/student_exam');
const { ContextHandlerImpl } = require('express-validator/src/chain');
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true })

class AnswerController extends Controller {
    async answer(req, res, next) {
        let result = await this.validateForm(req);
        if (result) {
            this.answerProcess(req, res, next);
        } else {
            return this.back(req, res);
        }
    }
    async answerProcess(req, res, next) {
        let media = '';
        let currentTime;
        let currentDate;
        let exam = null;
        let questions = null;
        try {
            currentTime = (await helper.currentTime()).en;
            currentDate = (await helper.currentDate()).en;
        } catch (ex) {
            currentTime = helper.convertPersianDigitsToEnglish(moment(Date.now()).format('hh:mm'));
            currentDate = helper.convertPersianDigitsToEnglish(moment(Date.now()).format('jYYYY/jMM/jDD'));
        }
        try {
            exam = await Exam.findById(req.body.exam).populate(['questions']);
            questions = await exam_question.getAllQuestionsForSingleExam(exam._id)
        } catch (ex) {
            req.flash('errors', 'خطایی در ثبت پاسخ رخ داد');
            return this.back(req, res);
        }
        let started = await helper.isExamStarted(exam._id);;
        let ended = await helper.isExamEnded(exam._id);

        if (ended) {
            exam.finished = true;
            await exam.save();
            return this.back(req, res);
        }
        
        
        for (let i = 1; i <= questions.length; i++) {
            if(!req.body[`answer-${i}`]){
                continue;
            }
            
            let answer = await Answer.findOne({ question: req.body[`question-${i}`],student: req.user._id});
            
            if (answer) {
                let mediaPath = `./public${answer.media}`;
                if (answer.media && fs.existsSync(mediaPath)) {
                    fs.unlinkSync(mediaPath);
                }
                await answer.remove();
            }
            let media = '';
            
            let newAnswer = new Answer({
                question: req.body[`question-${i}`],
                answer: req.body[`answer-${i}`],
                exam: req.body.exam,
                student: req.user._id,
                media
            });
            await newAnswer.save();
        }
        
        try {
            
        } catch (ex) {
            
            req.flash('errors', 'پاسخ ثبت نشد');
        }
        return this.back(req, res);
    }
    async destroy(req, res, next) {
        try {

            let answer = await Answer.findOne({
                $or: [
                    { question: req.params.id },
                    { practice: req.params.id }
                ]
            }).populate(['question']);

            if (!answer) {
                req.flash('errors', 'پاسخ یافت نشد');
            } else {
                let filePath = `./public${answer.media}`;
                if (answer.media && fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                await answer.remove();
            }
        } catch (ex) {
            req.flash('errors', 'خطایی در حذف پاسخ رخ داد');
        }
        return this.back(req, res);
    }
    async download(req, res, next) {
        try {
            let answer = await Answer.findById(req.params.answerId);
            if (answer.media) {
                if (fs.existsSync(`./public${answer.media}`)) {
                    res.download(`./public${answer.media}`);
                }
            }
        } catch (ex) {
            req.flash('errors', 'خطایی دانلود رخ داد');
        }
    }
    async correction(req, res, next) {
        let { answerId } = req.params;
        try {
            let answer = await Answer.findById(answerId).populate(['question']);
            let studentExam = await student_exam.model.findOne({$and: [{student: answer.student}, {exam: answer.exam}]});
            if (!answer || !studentExam) {
                req.flash('errors', 'پاسخ یافت نشد');
                return this.back(req, res);
            }
            answer.status = req.body.status == 'true' ? true : false;
            
            answer.corrected = true;
            answer.grade = helper.faDigitsToEn(req.body.grade);
            if(+helper.faDigitsToEn(req.body.grade) > +answer.question.grade){
                req.flash('errors', 'نمره وارد شده از نمره نعیین شده برای سوال بیشتر است');
                return this.back(req, res);
            }
            studentExam.grade = (+studentExam.grade + +answer.grade).toString();
            await answer.save();
            await studentExam.save();
        } catch (ex) {
            req.flash('errors', 'خطایی در بازگردانی اطلاعات پاسخ رخ داد');
        }
        return this.back(req, res);
    }
    async answers(req, res, next) {
        let { examId, studentId } = req.params;
        try {
            let exam = await Exam.findById(examId);
            let questions = await exam_question.getAllQuestionsForSingleExam(examId, studentId);
            
            if (!exam) {
                req.flash('errors', 'آزمون یافت نشد');
                return this.back(req, res);
            }
            let _student_exam = await student_exam.model.findOne({ $and: [{ exam: examId }, { student: studentId }] }).populate(['student', 'exam']);
            let student = await User.findById(_student_exam.student._id);
            if (!student_exam || !student) {
                req.flash('errors', 'دانش آموز یافت نشد');
                return this.back(req, res);
            }
            
            let answers = await Answer.find({ student: student._id });
            return res.render('student/answers', {
                errors: req.flash('errors'),
                success: req.flash('success'),
                path: 'exams',
                student,
                answers,
                exam,
                questions,
                student_exam: _student_exam
            });
        } catch (ex) {
            console.log(ex);
            req.flash('errors', 'خطایی در بازگردانی پاسخ ها رخ داد');
            return this.back(req, res);
        }
    }
    async deleteCorrection(req, res, next){
        let { answerId } = req.params;
        try{
            let answer = await Answer.findById(answerId);
            let studentExam = await student_exam.model.findOne({$and: [{student: answer.student}, {exam: answer.exam}]});
            if(!answer || !studentExam){
                req.flash('errors', 'پاسخ یافت نشد');
            }else{
                studentExam.grade = (+studentExam.grade - +answer.grade).toString();
                if(+studentExam.grade < 0){
                    studentExam.grade = '0';
                }
                answer.corrected = false;
                answer.status = null;
                answer.grade = '';
                await answer.save();
                await studentExam.save();
            }
        }catch(ex){
            req.flash('errors', 'خطایی در حذف تصحیح رخ داد');
            
        }
        return this.back(req, res);
    }
    async changeGrade(req, res, next){
        let {studentId: student, examId: exam} = req.params;
        let grade = helper.faDigitsToEn(req.body.grade);
        try{
            let studentExam = await student_exam.model.findOne({$and: [{student}, {exam}]});
            studentExam.grade = grade;
            await studentExam.save();
        }catch(ex){
            req.flash('errors', 'خطایی در تغییر نمره رخ داد');
        }
        return this.back(req, res);
    }
}

module.exports = new AnswerController();
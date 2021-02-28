const Controller = require('./controller');
const Exam = require('../../models/exam');
const Class = require('../../models/class');
const moment = require('moment-jalaali');
const helper = require('../../helper/helperFunctions');
const fs = require('fs');
const Answer = require('../../models/answer');
const mkdirp = require('mkdirp');
const PDFDocument = require('pdfkit');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const student_exam = require('../../models/conjuctions/student_exam');
const teacher_exam = require('../../models/conjuctions/teacher_exam');
const exam_question = require('../../models/conjuctions/exam_question');
const Question = require('../../models/question');
const path = require('path');
const questionController = require('../controllers/questionController');
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true })

class ExamController extends Controller {
    async examList(req, res, next) {
        let exams = null;
        let { search, filter } = req.query;
        let page = req.query.page || 1;
        search = helper.faDigitsToEn(search);
        
        if (search) {
            search = helper.convertPersianDigitsToEnglish(search);
        }
        try {
            exams = await Exam.paginate({
                teacher: req.user._id,
                $or: [
                    {title: {$regex: search}},
                    {date1: {$regex: search}},
                    {date2: {$regex: search}},
                    {time1: {$regex: search}},
                    {time2: {$regex: search}},
                ]}, {page, limit: 5, sort: {createAt: -1}});
            
        } catch (ex) {
            console.log(ex);
            req.flash('errors', 'خطایی در فراخوانی لیست آزمون ها رخ داد');
            return this.back(req, res);
        }

        for (let exam of exams.docs) {
            let ended = await helper.isExamEnded(exam._id);
            if (ended) {
                exam.finished = true;
            } else {
                exam.finished = false;
            }
            await exam.save();
        }
        return res.render('exam/exam_list', {
            exams,
            path: 'exams',
            errors: req.flash('errors'),
            success: req.flash('success'),
            helper,
            search,
            filter
        })
    }
    async createPage(req, res, next) {
        let classes = null;
        let exams = null;
        try {
            classes = await Class.find({});
            exams = await teacher_exam.getExamsForSingleTeacher(req.user._id);
            console.log(exams);
        } catch (ex) {
            console.log(ex);
            req.flash('errors', 'خطایی  نامعلوم رخ داد')
        }
        if (classes.length === 0) {
            req.flash('errors', 'شما هیچ کلاسی تعریف نکرده اید');

        }
        return res.render('exam/exam_create', {
            path: 'exams',
            classes,
            errors: req.flash('errors'),
            success: req.flash('success'),
            exams

        });
    }
    async create(req, res, next) {
        const result = await this.validateForm(req);
        if (result) {
            this.createProcess(req, res, next);
        } else {
            return this.back(req, res);
        }
    }

    async createProcess(req, res, next) {

        let { date1, date2, time1, time2, totalGrade, title } = req.body;
        date1 = helper.convertPersianDigitsToEnglish(date1);
        date2 = helper.convertPersianDigitsToEnglish(date2);
        time1 = helper.convertPersianDigitsToEnglish(time1);
        time2 = helper.convertPersianDigitsToEnglish(time2);
        totalGrade = helper.faDigitsToEn(totalGrade);
        let level = req.body.level.split(',');
        let code = await helper.generateExamUniqueCode(date1);

        const newExam = new Exam({
            title,
            level,
            code,
            date1,
            date2,
            time1,
            time2,
            teacher: req.user._id,
            totalGrade
        });

        try {

            if (req.body.mode == 'repeat') {

                let sampleExam = await Exam.findById(req.body.sampleExam);
                let questions = await exam_question.getAllQuestionsForSingleExam(sampleExam._id);

                return res.render('question/clone', {
                    questions,
                    exam: JSON.stringify(newExam),
                    path: 'exams',
                    sampleExam: req.body.sampleExam,
                    errors: req.flash('errors'),
                    success: req.flash('success')
                });
            } else if (req.body.mode == 'add') {

                await newExam.save();
                let newTeacher_exam = new teacher_exam.model({
                    teacher: req.user._id,
                    exam: newExam._id
                });
                await newTeacher_exam.save();

                req.flash('success', 'آزمون با موفقیت ثبت شد')
                return this.back(req, res);
            }
        } catch (ex) {
            req.flash('errors', 'خطایی در ایجاد آزمون رخ داد');
            return this.back(req, res);
        }


    }
    async clone(req, res, next) {
        let { examId } = req.params;
        try {
            let sampleExam = await Exam.findById(examId);
            if (!sampleExam) {
                req.flash('errors', 'آزمون نمونه یافت نشد');
                return this.back(req, res);
            } else {
                let exam = JSON.parse(req.body.exam);
                let questionIds = req.body.checked;
                let questions = await Question.find({ _id: { $in: questionIds } });
                let newExam = new Exam(exam);
                let newOne = await newExam.save();
                let newTeacherExam = new teacher_exam.model({
                    teacher: req.user._id,
                    exam: newOne._id
                });
                await newTeacherExam.save();


                questions.forEach(async question => {
                    let examQuestion = new exam_question.model({
                        exam: newOne._id,
                        question: question._id
                    });
                    await examQuestion.save();
                });
                req.flash('success', 'آزمون با موفقیت ثبت شد');
                return res.redirect('/panel/exam/list');
            }
        } catch (ex) {
            console.log(ex);
            req.flash('errors', 'خطایی در کپی کردن آزمون رخ داد');
            return this.back(req, res);
        }
    }
    async destroy(req, res, next) {
        let exam = null;
        try {
            exam = await Exam.findById(req.params.examId);
        } catch (ex) {
            req.flash('errors', 'خطایی در حذف آزمون رخ داد');
            return this.back(req, res);
        }
        if (!exam) {
            req.flash('errors', 'چنین آزمونی وجود ندارد');
            return this.back(req, res);
        }
        try {
            let teacherExam = await teacher_exam.model.find({exam: exam._id, teacher: req.user._id});
            teacherExam.forEach(async item => await item.remove());
            await exam.remove();
        } catch (ex) {
            req.flash('errors', 'خطایی در حذف آزمون رخ داد');
            return this.back(req, res);
        }
        return this.back(req, res);
    }

    async editPage(req, res, next) {
        let { examId } = req.params;
        let exam = null;
        try {
            exam = await Exam.findById(examId);
            let started = await helper.isExamStarted(exam._id);
            let ended = await helper.isExamEnded(exam._id);
            let questions = await exam_question.getAllQuestionsForSingleExam(exam._id);
            console.log('started: ', started);
            return res.render('exam/editPage', {
                path: 'exams',
                errors: req.flash('errors'),
                success: req.flash('success'),
                helper,
                exam,
                started,
                ended,
                questions
            });
        } catch (ex) {
            console.log(ex);
            req.flash('errors', 'خطایی در عملیات یافتن آزمون رخ داد');
            return this.back(req, res);
        }
    }
    async edit(req, res, next) {
        let result = await this.validateForm(req);
        if (result) {
            this.editProcess(req, res, next);
        } else {
            return this.back(req, res);
        }
    }
    async editProcess(req, res, next) {
        let { date1, date2, time1, time2} = req.body;
        let { examId } = req.params;
        let level = req.body.level.split(',');
        let newCode = await helper.generateExamUniqueCode(helper.faDigitsToEn(date1));
        let finished;
        let started = await helper.isExamStarted(examId);
        let ended = await helper.isExamEnded(examId);
        
        if ((started && !ended) || (!started && !ended)) {
            finished = false;
        } else {
            finished = true;
        }

        let fields = {
            title: req.body.title,
            level,
            date1: helper.convertPersianDigitsToEnglish(date1),
            date2: helper.convertPersianDigitsToEnglish(date2),
            time1: helper.convertPersianDigitsToEnglish(time1),
            time2: helper.convertPersianDigitsToEnglish(time2),
            code: newCode,
            totalGrade: helper.faDigitsToEn(req.body.totalGrade),
            finished
        };

        try {
            let answers = await Answer.find({exam: examId});
            answers.forEach(async answer => await answer.remove());
            await Exam.findByIdAndUpdate(examId, { ...fields });

        } catch (ex) {
            req.flash('errors', 'خطایی در عملیات ویرایش آزمون رخ داد');
            return this.back(req, res);
        }
        req.flash('success', 'ویرایش آزمون با موفقیت انجام شد');
        return res.redirect('/panel/exam/list');
    }
    async studentExamList(req, res, next) {
        try {
            
            let exams = await student_exam.getAllExamsForSingleStudent(req.user._id);
            let finalExams = [];
            for(let exam of exams){
                let ended = await helper.isExamEnded(exam._id);
                let started = await helper.isExamStarted(exam._id);
                finalExams.push({exam, started, ended});
            }
            return res.render('exam/studentExamList', {
                path: 'studentExams',
                errors: req.flash('errors'),
                success: req.flash('success'),
                exams: finalExams
            });
        } catch (ex) {
            req.flash('errors', 'خطایی در بازگردانی لیست آزمون ها رخ داد');
            return this.back(req, res);
        }
    }
    async joinExam(req, res, next) {
        let { code } = req.body;

        try {
            let exam = await Exam.findOne({ code });
            
            if (!exam) {
                req.flash('errors', 'آزمون یافت نشد');
            } else if (exam) {
                let ended = await helper.isExamEnded(exam._id);
                let started = await helper.isExamStarted(exam._id);
                
                if (!ended) {
                    let isIn = await student_exam.isStudentInExam(req.user._id, exam._id)
                    if (isIn) {
                        req.flash('errors', 'قبلا در این آزمون شرکت کرده اید');
                    } else {
                        let newStudentExam = new student_exam.model({
                            student: req.user._id,
                            exam: exam._id
                        });
                        await newStudentExam.save();
                    }
                }else if(ended){
                    req.flash('errors', 'آزمون پایان یافته است');
                }

            }

        } catch (ex) {
            console.log(ex);
            req.flash('errors', 'خطایی در پیوستن به آزمون رخ داد');
        }
        return this.back(req, res);
    }
    async leftExam(req, res, next) {
        let { examId } = req.params;
        try {
            let isIn = await student_exam.isStudentInExam(req.user._id, examId);
            if (isIn) {
                let studentExam = await student_exam.model.findOne({
                    $and: [
                        {
                            exam: examId,
                            student: req.user._id
                        }
                    ]
                })
                await studentExam.remove();
            }
        } catch (ex) {
            req.flash('errors', 'خطایی در خروج از آزمون رخ داد');
        }
        return this.back(req, res);
    }
    async examSinglePage(req, res, next) {
        let { examId } = req.params;
        try {
            let exam = await Exam.findById(examId);
            let studentExam = await student_exam.model.findOne({ $and: [{ student: req.user._id }, { exam: exam._id }] });
            let questions = await exam_question.getAllQuestionsForSingleExam(exam._id, req.user._id);
            let started = await helper.isExamStarted(exam._id);
            let ended = await helper.isExamEnded(exam._id);
            if (ended) {
                exam.finished = true;
                await exam.save();
            }
            
            return res.render('exam/singlePage', {
                path: 'studentExam',
                errors: req.flash('errors'),
                success: req.flash('success'),
                exam,
                started,
                ended,
                questions,
                examGrade: studentExam ? studentExam.grade : null,
                
            });
        } catch (ex) {
            console.log(ex);
            req.flash('errors', 'آزمون یافت نشد');
            return this.back(req, res);
        }
    }
    async correctionPage(req, res, next) {
        let { examId } = req.params;
        try {
            let exam = await Exam.findById(examId).populate([
                {
                    path: 'questions',
                    populate: {
                        path: 'answers',
                        match: { corrected: false },
                        populate: {
                            path: 'student'
                        }
                    }
                }
            ]);
            
            
            let students = await student_exam.getAllStudentsForSingleExam(exam._id);
            if (!exam) {
                req.flash('errors', 'آزمون یافت نشد');
                return this.back(req, res);
            }
            return res.render('exam/correction', {
                path: 'exams',
                errors: req.flash('errors'),
                success: req.flash('success'),
                exam,
                students,
                helper
            });
        } catch (ex) {
            req.flash('errors', 'خطایی در بازگردانی اطلاعات آزمون رخ داد');
            return this.back(req, res);
        }
    }

   

    async exportPdf(req, res, next) {
        
        let { examId } = req.params;
        try {
            let exam = await Exam.findById(examId).populate([
                {
                    path: 'questions',
                    populate: {
                        path: 'answers'
                    }
                }
            ]);

            // let studentExam = await student_exam.model.findOne({ $and: [{ student: req.user._id }, { exam: examId }] }).populate(['student']);
            // let questions = await exam_question.getAllQuestionsForSingleExam(examId, req.user._id);
            // let started = await helper.isExamStarted(exam._id);
            // let ended = await helper.isExamEnded(exam._id);
            // let pdf = new PDFDocument();
            let Path = `./public/downloads/pdf`;
            
            let filename = `${exam.code}.pdf`;
            if (!fs.existsSync(Path)) {
                let s = await mkdirp(Path);
            }
            if (fs.existsSync(`${Path}/${filename}`)) {
                filename = `${Date.now()}-${filename}`;
            }
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(req.header('referer'));
            await page.type('#username', req.user.nationalCode);
            await page.type('#password', req.user.nationalCode);
            await page.click('#submit');
            await page.waitForNavigation();
            await page.goto(req.header('referer'));
                        
            await page.pdf({path: `${Path}/${filename}`});
            await browser.close();
            
            return res.download(`${Path}/${filename}`);
        } catch (ex) {
            console.log(ex);
            req.flash('errors', 'خطایی در ساخت فایل پی دی اف رخ داد');
            return this.back(req, res);
        }
    }
    async activateAddQuestionMode(req, res, next){
        let {examId} = req.params;
        let mode = 'exam_addQuestion_mode';
        let selectedQuestions = await exam_question.getAllQuestionsForSingleExam(examId);
        selectedQuestions = selectedQuestions.map(question => question._id)
        await questionController.questionList(req, res, next, mode, examId, selectedQuestions);
    }
    async questions(req, res, next){
        let {examId} = req.params;
        try{
            let questions = await exam_question.getAllQuestionsForSingleExam(examId);
            
            if(!exam){
                req.flash('errors', 'آزمون یافت نشد');
                return this.back(req, res);
            }
            return res.render('exam/questions', {
                errors: req.flash('errors'),
                success: req.flash('success'),
                path: 'exams',
                questions
            });
        }catch(ex){
            req.flash('errors', 'خطایی در بازگردانی لیست سوالات آزمون رخ داد');
            return this.back(req, res);
        }
    }
}


module.exports = new ExamController();




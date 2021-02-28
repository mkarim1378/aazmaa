const Controller = require('./controller');
const Question = require('../../models/question');
const Exam = require('../../models/exam');
const Answer = require('../../models/answer');
const fs = require('fs');
const helper = require('../../helper/helperFunctions');
const Category = require('../../models/category');
const exam_question = require('../../models/conjuctions/exam_question');
const exam = require('../../models/exam');

class QuestionController extends Controller {
    async createPage(req, res, next) {
        const categories = await Category.find({}).select(['_id', 'title']);
        return res.render('question/question_create', {
            path: 'questions',
            errors: req.flash('errors'),
            success: req.flash('success'),
            categories: JSON.stringify(categories)
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
        let media = '';
        if (req.file) {
            media = `${req.file.destination}/${req.file.filename}`.substring(8);
        }
        let html = req.body.html;
        let grade = await helper.faDigitsToEn(req.body.grade);
        let lines = req.body.question.split(`\r\n`);
        let answerTypes = req.body.answerTypes.split(',');
        let categories = req.body.categories != 'undefined' ? req.body.categories.split(',') : [];

        lines.pop();
        let newQuestion = new Question({
            question: lines,
            media,
            answerTypes,
            questionType: req.body.questionType,
            mediaType: req.body.mediaType,
            options: req.body.options,
            exam: req.body.exam,
            grade,
            categories,
            html,
        });
        try {
            await newQuestion.save();
        } catch (ex) {
            console.log(ex);
            req.flash('errors', 'خطایی در ذخیره سوال رخ داد');
            return this.back(req, res);
        }
        req.flash('success', 'سوال با موفقیت ثبت شد');
        return this.back(req, res);
    }
    async destroy(req, res, next) {
        let question = null;
        const { questionId } = req.params;
        try {
            question = await Question.findById(questionId);
            if (question.media && fs.existsSync(`./public${question.media}`)) {
                fs.unlinkSync(`./public${question.media}`);
            }
            question.remove();
        } catch (ex) {
            req.flash('errors', 'خطایی در حذف سوال رخ داد');
            this.back(req, res);
        }

        return this.back(req, res);
    }
    async questionList(req, res, next, mode = '', examId = '', selectedQuestions = []) {
        const categories = await Category.find({}).select(['_id', 'title', 'image']);
        
        return res.render('category/index', {
            path: 'questions',
            errors: req.flash('errors'),
            success: req.flash('success'),
            categories,
            mode,
            exam: examId,
            selectedQuestions
            
        });
    }
    async allQuestionList(req, res, next, srch, categories, pageMode) {
        let questions = null;
        let search = req.query.search || '';
        let filter = req.query.filter || '';
        let page = req.query.page || 1;
        let mode = pageMode || 'none';
        if (srch && (srch != '')) search = srch;
        
        try {
            let allCAtegories = (await Category.find({})).map(category => category._id);
            
            questions = await Question.paginate({
                $or: [
                    { question: { $regex: search } },
                    { questionType: { $regex: search } },
                    {categories: categories}
                ]
            }, {sort:{ createdAt: (filter == 'dateDec' ? -1 : 1)}, page, limit: 2 , populate: ['categories']});
            if (filter == 'short-answer' ||
                filter == 'true-false' ||
                filter == '4-options' ||
                filter == 'long') {
                questions.docs = questions.docs.filter(question => question.questionType == filter);
            }
            console.log('pages: ', questions.pages);
        } catch (ex) {
            console.log(ex);
            req.flash('errors', 'خطایی در خواندن لیست سوالات رخ داد');
        }

        return res.render('question/question_list', {
            path: 'questions',
            errors: req.flash('errors'),
            success: req.flash('success'),
            questions,
            search,
            filter,
            helper,
            mode
        })
    }
    async editPage(req, res, next) {
        let question = null;
        let categories = null;
        try {
            question = await Question.findById(req.params.questionId);
            categories = await Category.find({});
        } catch (ex) {
            req.flash('errors', 'خطایی در یافتن سوال رخ داد');
            return this.back(req, res);
        }
        return res.render('question/editPage', {
            path: 'questions',
            errors: req.flash('errors'),
            success: req.flash('success'),
            question,
            categories: JSON.stringify(categories),
            selectedCategories: JSON.stringify(question.categories)
        })
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
        
        let { questionId } = req.params;
        
        try {
            let question = await Question.findById(questionId);
            let media = '';
            if (req.file) {
                media = `${req.file.destination}/${req.file.filename}`.substring(8);
            }

            let grade = await helper.faDigitsToEn(req.body.grade);
            let lines = req.body.question.split(`\r\n`);
            let answerTypes = req.body.answerTypes.split(',');

            let categories = req.body.categories.split(',');
            lines.pop();

            let args = {
                question: lines || [],
                media: media != '' ? media : question.media,
                answerTypes,
                questionType: req.body.questionType,
                mediaType: req.body.mediaType,
                options: req.body.options,
                exam: req.body.exam,
                grade,
                html: req.body.html || '',
                categories
            };
            await Question.findByIdAndUpdate(questionId, args);
            req.flash('success', 'ویرایش سوال با موفقیت انجام شد');
            return this.back(req, res);
        } catch (ex) {
            console.log(ex);
            req.flash('errors', 'خطایی در ویرایش سوال رخ داد');
            return this.back(req, res);
        }

    }
    async download(req, res, next) {
        let { questionId } = req.params;

        try {
            let question = await Question.findById(questionId);
            if (question.media) {
                let filePath = `./public${question.media}`;
                if (fs.existsSync(filePath)) {
                    res.download(filePath);
                }
            }
        } catch (ex) {
            console.log(ex);
            return this.back(req, res);
        }
    }

    async addToExam(req, res, next){
        let questions = JSON.parse(req.body.selectedQuestions);
        
        let examId = req.body.examId;
        try{
            let examQuestions = await exam_question.model.find({exam: examId});
            
            examQuestions.forEach(async item => {
                if(!questions.includes(item.question.toString())){
                    await item.remove();
                }
            });
            examQuestions = await exam_question.model.find({exam: examId}).select(['question']);
            examQuestions = examQuestions.map(item => item.question.toString());
            questions.forEach(async questionId => {
                if(!examQuestions.includes(questionId)){
                    let newExamQuestion = new exam_question.model({
                        exam: examId,
                        question: questionId
                    });
                    await newExamQuestion.save();
                }
                
            });
            
            examQuestions.forEach(async item => {
                
                if(!questions.includes(item.question)){
                    await item.remove();
                }
            });
            
            console.log('examId: ', examId);
            return res.redirect(`/panel/exam/edit/${examId}`);
        }catch(ex){
            req.flash('errors', 'خطایی در افزودن سوالات به آزمون رخ داد');
            return this.back(req, res);
        }
    }
    async removeFromExam(req, res, next){
        let {examId, questionId} = req.params;
        try{
            let examQuestion = await exam_question.model.findOne({exam: examId, question: questionId});
            let answers = await Answer.find({exam: examId, question: questionId});
            if(!examQuestion){
                req.flash('errors', 'خطایی در حذف سوال از آزمون رخ داد');
            }else{
                await examQuestion.remove();
            }
            answers.forEach(async answer => await answer.remove());
        }catch(ex){
            req.flash('errors', 'خطایی در حذف سوال از آزمون رخ داد');
        }
        return this.back(req, res);
    }
}

module.exports = new QuestionController();
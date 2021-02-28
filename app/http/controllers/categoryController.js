const Controller = require('./controller');
const Category = require('../../models/category');
const Question = require('../../models/question');
const questionController = require('../controllers/questionController');

class CategoryController extends Controller { 
    async create(req, res, next){
        const result = await this.validateForm(req);
        if(result){
            this.createProcess(req, res, next);
        }else{
            return this.back(req, res);
        }
    }
    slug(title){
        return title.split(' ').join('-').toString();
    }
    async createProcess(req, res, next){
        let { title } = req.body;
        let image = '/images/icons/imagePlaceholder3.png';
        if(req.file){
            image = `${req.file.destination}/${req.file.filename}`.substring(8);
        }
        try{
            let newCategory = new Category({
                title, 
                image,
                slug: this.slug(title)
            });
            await newCategory.save();
        }catch(ex){
            console.log(ex);
        }
        return this.back(req, res)
    }
    async withoutCategory(req, res, next){
        let search = req.query.search || '';
        try{
            questionController.allQuestionList(req, res, next, search, undefined, 'none')
            
        }catch(ex){
            req.flash('errors', 'خطایی در بازگردانی لیست سوالات رخ داد');
            return this.back(req, res);
        }
    }
    async questions(req, res, next){
        let { categoryId } = req.params;
        let {search} = req.query || '';
        try{
            questionController.allQuestionList(req, res, next, search, categoryId)
            
        }catch(ex){
            req.flash('errors', 'خطایی در بازگردانی لیست سوالات رخ داد');
            return this.back(req, res);
        }
    }
}


module.exports = new CategoryController();
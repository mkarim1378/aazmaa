const Controller = require('./controller');
const Practice = require('../../models/practice');
const helper = require('../../helper/helperFunctions');
const fs = require('fs');

class PracticeController extends Controller {
    async addPractice(req, res, next){
        let result = await this.validateForm(req);
        
        if(result){
            this.addProcess(req, res, next);
        }else{
            return this.back(req, res);
        }
    }
    slug(str){
        return str.split(' ').join('-').toString();
    }
    async addProcess(req, res, next){
        let file = '';
        let { title, description, classId, deadlineDate} = req.body;
        description = description.split('\r\n');
        description.pop();
        
        deadlineDate = helper.convertPersianDigitsToEnglish(deadlineDate);
        let deadlineTime = deadlineDate.split('-')[1];
        deadlineDate = deadlineDate.split('-')[0];
        if(req.file){
            file = `${req.file.destination}/${req.file.filename}`.substring(8);
        }
        
        let newPractice = new Practice({
            title,
            description: description || '',
            file,
            classId,
            deadlineDate,
            deadlineTime,
            slug: this.slug(title)
        });
        try{
            await newPractice.save();
            
            req.flash('success', 'تمرین با موفقیت ثبت شد');
            return this.back(req, res);
        }catch(ex){
            req.flash('errors', 'خطایی در ذخیره تمرین رخ داد');
            return this.back(req, res);
        }
    }
    async destroy(req, res, next){
        let deleted = null;
        
        try{
            deleted = await Practice.findByIdAndRemove(req.params.practiceId);    
            let path = `./public${deleted.file}`;
            if(deleted.file && deleted.file !== ''){
                fs.unlinkSync(path);
            }
            return this.back(req, res);
        }catch(ex){
            req.flash('errors', 'خطایی در حذف تمرین رخ داد');
            return this.back(req, res);
        }
    }
    async download(req, res, next){
        let { slug } = req.params;
        let practice = null;
        try{
            practice = await Practice.findOne({slug});
            if(!practice){
                req.flash('errors', 'فایلی برای دانلود یافت نشد');
                return this.back(req, res);    
            }
            res.download(`./public${practice.file}`);
            
        }catch(ex){
            req.flash('errors', 'خطایی در دانلود رخ داد');
            return this.back(req, res);
        }
    }
}


module.exports = new PracticeController();
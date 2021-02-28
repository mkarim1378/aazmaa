const Controller = require('./controller');
const Notification = require('../../models/notification');
const helper = require('../../helper/helperFunctions');
const fs = require('fs');

class NotificationController extends Controller { 
    async add(req, res, next){
        const result = await this.validateForm(req);
        if(result){
            this.addProcess(req, res, next);
        }else{
            return this.back(req, res);
        }
    }

    slug(title){
        return title.split(' ').join('-').toString();
    }
    async addProcess(req, res, next){
        let { title, body, date, classId} = req.body;
        let file = '';
        body = body.split('\r\n');
        body.pop();
        date = helper.convertPersianDigitsToEnglish(date);
        
        if(req.file){
            file = `${req.file.destination}/${req.file.filename}`.substring(8);
        }
        
        let newNotification = new Notification({
            title,
            body,
            date, 
            file,
            classId,
            slug: this.slug(title)
        });
        try{
            await newNotification.save();     
            req.flash('success', 'اطلاعیه با موفقیت ثبت شد');
        }catch(ex){
            req.flash('errors', 'خطایی در ذخیره اطلاعیه رخ داد');
        }
        
        return this.back(req, res);
    }
    async destroy(req, res, next){
        try{
            let notification = await Notification.findById(req.params.notificationId);
            if(notification.file && fs.existsSync(`./public${notification.file}`)){
                fs.unlinkSync(`./public${notification.file}`);
            }
            await notification.remove();
        }catch(ex){
            req.flash('errors', 'خطایی در حذف اطلاعیه رخ داد');
        }
        return this.back(req, res);
    }
    async download(req, res, next){
        try{
            let notification = await Notification.findOne({slug: req.params.slug});
            if(!notification){
                req.flash('errors', 'اطلاعیه یافت نشد');
                return this.back(req, res);
            }else{
                res.download(`./public${notification.file}`);
            }
        }catch(ex){
            req.flash('errors', 'خطایی در دانلود فایل ضمیمه رخ داد');
            return this.back(req, res);
        }
        
    }
}

module.exports = new NotificationController();
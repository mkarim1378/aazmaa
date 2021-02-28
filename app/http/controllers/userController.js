const Controller = require('./controller');
const User = require('../../models/user');
const Role = require('../../models/role');
const student_class = require('../../models/conjuctions/student_class');
const student_exam = require('../../models/conjuctions/student_exam');
const fs = require('fs');
const Answer = require('../../models/answer');

class UserController extends Controller {
    async index(req, res, next) {
        let users = null;
        try {
            users = await User.find({});
            return res.render('user/index', {
                users,
                path: 'users',
                errors: req.flash('errors'),
                success: req.flash('success')
            })
        } catch (ex) {
            req.flash('errors', 'خطایی در برگرداندن لیست کاربران رخ داد');
            return this.back(req, res);
        }
    }
    async editPage(req, res, next) {
        let user = null;
        let roles = null;
        try {
            user = await User.findById(req.params.userId).populate([{
                path: 'role',
                populate: {
                    path: 'permissions'
                }
            }]);
            if (!user) {
                req.flash('errors', 'چنین کاربری وجود ندارد');
                return this.back(req, res);
            }
            
            roles = await Role.find({}).populate(['permissions']);
            
            return res.render('user/edit', {
                path: 'users',
                errors: req.flash('errors'),
                success: req.flash('success'),
                selectedRole: JSON.stringify(user.role),
                roles: JSON.stringify(roles),
                user
            });
        } catch (ex) {
            req.flash('errors', 'خطایی در پیدا کردن کاربر رخ داد');
            return this.back(req, res);
        }
    }
    async edit(req, res, next) {
        let result = await this.validateForm(req);
        if(!result){
            return this.back(req, res);
        }else{
            this.editProcess(req, res, next);
        }
        
    }
    async editProcess(req, res, next) {
        let profile = '';
        let { name, family, phoneNumber, nationalCode } = req.body;
        let role = req.body.role.split(',');
        if (req.file) {
            profile = `${req.file.destination}/${req.file.filename}`.substring(8);
        }
        try {
            let user = await User.findOne({nationalCode});
            if(!user){
                req.flash('errors', 'کاربری با این کد ملی یافت نشد');
                return this.back(req, res);
            }
            await User.findByIdAndUpdate(user._id, {
                profile: profile || user.profile,
                name,
                family,
                phoneNumber,
                nationalCode,
                role
            });
            req.flash('success', 'ویرایش کاربر با موفقیت انجام شد');
            return res.redirect('/panel/users');
        } catch (ex) {
            req.flash('errors', 'خطایی در ویرایش کاربر رخ داد');
            return this.back(req, res);
        }
    }
    async destroy(req, res, next){
        try{
            let user = await User.findById(req.params.userId);
            let profilePath = `./public${user.profile}`;
            let studentClasses = await student_class.model.find({student: user._id});
            let studentExams = await student_exam.model.find({student: user._id});
            let answers = await Answer.find({student: req.params.userId});
            answers.forEach(async answer => {
                await answer.remove();
            });
            studentClasses.forEach(async item => await item.remove());
            studentExams.forEach(async item => await item.remove());
            if(user.profile && fs.existsSync(profilePath)){
                fs.unlinkSync(profilePath);
            }
            await user.remove();
        }catch(ex){
            req.flash('errors', 'خطایی در عملیات حذغ کاربر رخ داد');
            console.log(ex);
        }
        return this.back(req, res);
    }
}

module.exports = new UserController();
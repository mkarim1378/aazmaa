const Controller = require('./controller');
const Permission = require('../../models/permission');

class PermissionController extends Controller { 
    async index(req, res, next){
        let permissions = null;
        try{
            permissions = await Permission.find({});
            return res.render('permission/index', {
                path: 'access',
                permissions,
                errors: req.flash('errors'),
                success: req.flash('success')
            });
        }catch(ex){
            req.flash('errors', 'خطایی در بازگردانی لیست مجوزها رخ داد');
            return this.back(req, res);
        }
    }
    async destroy(req, res, next){
        try{
            await Permission.findByIdAndRemove(req.params.permissionId);
            return this.back(req, res);
        }catch(ex){
            req.flash('errors', 'خطایی در حذف مجوز رخ داد');
            return this.back(req, res);
        }
    }
    async addPage(req, res, next){
        res.render('permission/create', {
            path: 'access',
            errors: req.flash('errors'),
            success: req.flash('success')
        });
    }
    async add(req, res, next){
        let result = await this.validateForm(req);
        if(result){
            this.addProcess(req, res, next);
        }else{
            return this.back(req, res);
        }
    }
    async addProcess(req, res, next){
        let {name, label} = req.body;
        try{
            let newPermission = new Permission({
                name,
                label
            });
            await newPermission.save();
            req.flash('success', 'ایجاد دسترسی با موفقیت انجام شد');
            return this.back(req, res);
        }catch(ex){
            req.flash('errors', 'خطایی در ذخیره دسترسی رخ داد');
            return this.back(req, res);
        }
    }
    async editPage(req, res, next){
        let permission = null;
        try{
            permission = await Permission.findById(req.params.permissionId);
            return res.render('permission/edit', {
                path: 'access',
                errors: req.flash('errors'),
                success: req.flash('success'),
                permission
            });
        }catch(ex){
            req.flash('errors', 'خطایی در یافتن مجوز رخ داد');
            return this.back(req, res);
        }
        
    }
    async edit(req, res, next){
        try{
            await Permission.findByIdAndUpdate(req.params.permissionId, {
                name: req.body.name,
                label: req.body.label
            });
        }catch(ex){
            req.flash('errors', 'خطایی در یافتن مجوز رخ داد');
        }
        return res.redirect('/panel/permissions');
        
    }
}


module.exports = new PermissionController();
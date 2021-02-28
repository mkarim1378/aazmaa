const Controller = require('./controller');
const Role = require('../../models/role');
const Permission = require('../../models/permission');

class RoleController extends Controller {
    async index(req, res, next) {
        let roles = null;
        try {
            roles = await Role.find({}).populate('permissions');
            
            return res.render('role/index', {
                path: 'access',
                errors: req.flash('errors'),
                success: req.flash('success'),
                roles
            });
        } catch (ex) {
            req.flash('errors', 'خطایی در بازگردانی لیست سطوج دسترسی رخ داد');
            return this.back(req, res);
        }
    }

    async addPage(req, res, next) {
        let permissions = null;
        try{
            permissions = await Permission.find({});
        }catch(ex){
            req.flash('errors', 'خطایی در بازگردانی لیست مجوزها رخ داد')
        }
        
        return res.render('role/create', {
            path: 'access',
            errors: req.flash('errors'),
            success: req.flash('success'),
            permissions: JSON.stringify(permissions)
        });
    }
    async add(req, res, next) {
        let result = await this.validateForm(req);
        if(result){
            this.addProcess(req, res, next);
        }else{
            return this.back(req, res);
        }
    }

    async addProcess(req, res, next) {
        let {name, label} = req.body;
        let permissions = req.body.permissions.split(',');
        let newRole = null;
        try{
            newRole = new Role({
                name, 
                label, 
                permissions
            })
            await newRole.save();
            req.flash('success', 'سطح دسترسی جدید ایجاد شد');
        }catch(ex){
            req.flash('errors', 'خطایی در ذخیره سطح دسترسی رخ داد');
            
        }
        return this.back(req, res);
    }
    async destroy(req, res, next) {
        let role = null;
        try {
            role = await Role.findById(req.params.roleId);
            await role.remove();
        } catch (ex) {
            req.flash('errors', 'خطایی در حذف سطح دسترسی رخ داد');

        }
        return this.back(req, res);
    }

    async editPage(req, res, next) {
        let role = null;
        let permissions = null;
        try{
            role = await Role.findById(req.params.roleId).populate(['permissions']);
            if(!role){
                req.flash('errors', 'چنین سطح دسترسی ای وجود ندارد');
                return this.back(req, res);
            }
            permissions = await Permission.find({});
            return res.render('role/edit', {
                path: 'access',
                errors: req.flash('errors'),
                success: req.flash('success'),
                permissions: JSON.stringify(permissions),
                selectedPermissions: JSON.stringify(role.permissions),
                role
            });
        }catch(ex){
            req.flash('errors', 'خطایی در یافتن سطح دسترسی رخ داد');
            return this.back(req, res);
        }
        
    }
    async edit(req, res, next){
        let {name, label} = req.body;
        let permissions = req.body.permissions.split(',');
        let role = null;
        try{
            role = await Role.findByIdAndUpdate(req.params.roleId, {
                name, 
                label, 
                permissions
            });
            return res.redirect('/panel/roles');
        }catch(ex){
            req.flash('errors', 'خطایی در ویرایش سطح دسترسی رخ داد');
            return this.back(req, res);
        }
    }
}


module.exports = new RoleController();
const Middleware = require('./middleware');
const User = require('../../models/user');
const Role = require('../../models/role');
const Permission = require('../../models/permission');
const helper = require('../../helper/helperFunctions');

class CanAccess extends Middleware {
    handle(...permission) {
        return async function (req, res, next) {
            let can = false;

            try {
                let user = await User.findById(req.user._id);
                if(user.isAdmin){
                    return next();
                }
                for (let roleId of user.role) {
                    let role = await Role.findById(roleId);
                    if (await helper.roleHasPermission(role._id, permission)) {
                        can = true;
                        break;
                    }
                }
                if (can) {
                    next();
                } else {
                    return res.redirect('/');
                }
            } catch (ex) {
                req.flash('errors', 'خطایی در یافتن کاربر رخ داد');
                console.log(ex);
                return res.redirect('/');
            }
        }
    }
    check(permission) {
        return async function (req, res, next) {
            let can = false;
            
            try {
                let user = await User.findById(req.user._id);
                if(user.isAdmin){
                    return true;
                }
                for (let roleId of user.role) {
                    let role = await Role.findById(roleId);
                    if (await helper.roleHasPermission(role._id, permission)) {
                        can = true;
                        break;
                    }
                }
                return can
            } catch (ex) {
                console.log(ex);
            }
        }
    }
}


module.exports = new CanAccess();
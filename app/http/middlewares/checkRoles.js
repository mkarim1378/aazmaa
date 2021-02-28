const Middleware = require('./middleware');
const Role = require('../../models/role');
const Permission = require('../../models/permission');
const User = require('../../models/user');

class CheckRoles extends Middleware {
    async handle(req, res, next) {
        try {
            await this.checkForPermission('class');
            await this.checkForPermission('exam');
            await this.checkForPermission('question');
            await this.checkForPermission('students');
            await this.checkForPermission('access');
            await this.checkForPermission('user');
            await this.checkForPermission('notification');
            await this.checkForPermission('permission');
            await this.checkForPermission('role');
            await this.checkForPermission('practice');
            await this.checkForPermission('student-class');
            await this.checkForPermission('student-exam');
            await this.checkForPermission('admin-notification');
            await this.checkForPermission('category');
            await this.checkForAdminRole();
            //studentRole
            //student permissions

            //institute role
            //institute permissions

            //university role
            //university permissions

            await this.checkForAdminUsersRole();
            await this.checkForAdminPermissions();
            req.session.checkRoles = true;
        } catch (ex) {
            console.log(ex);
        }
        next();
    }
    
    async checkForAdminPermissions(){
        try{
            let permissions = (await Permission.find({})).map(permission => permission._id);
            
            let adminRoles = await Role.find({name: 'admin'});
            for(let role of adminRoles){
                
                if(role.permissions.length != permissions.length){
                    role.permissions = permissions;
                    await role.save();
                }
            }
        }catch(ex){
            console.log(ex);
        }
    }
    async checkForAdminUsersRole(){
        try{
            let users = await User.find({isAdmin: true});
            let adminRole = await Role.findOne({name: 'admin'});
            for(let user of users){
                if(!user.role.includes(adminRole._id)){
                    user.role.push(adminRole._id);
                }
                await user.save();
            }
        }catch(ex){
            console.log(ex);
        }
    }
    async checkForPermission(name) {
        try {
            let permissions = await Permission.find({});
            permissions = permissions.map(permission => permission.name);
            
            if (!permissions.includes(name)) {
                let newPermission = new Permission({
                    name,
                    label: name
                });
                await newPermission.save();
            }
        } catch (ex) {
            console.log(ex);
        }
    }
    async checkForAdminRole() {
        try{
            let roles = await Role.find({});
            roles = roles.map(role => role.name)
            let permissions = await Permission.find({});
            permissions = permissions.map(permission => permission._id);
            if(!roles.includes('admin')){
                let newRole = new Role({
                    name: 'admin', 
                    label: 'admin',
                    permissions
                });
                await newRole.save();
            }
        }catch(ex){
            console.log(ex);
        }
    }
}


module.exports = new CheckRoles();

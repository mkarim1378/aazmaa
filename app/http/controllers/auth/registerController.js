const Controller = require('./../controller')
const passport = require('passport');

class RegisterController extends Controller{

    index(req, res, next){
        
        return res.render('auth/register', {
            errors: req.flash('errors')
        });
    }

    async register(req, res, next){
        
        let result = await this.validateForm(req);
        if(result){  
            this.registerProcess(req, res, next);
        }else{
            return this.back(req, res);
        }
    }

    async registerProcess(req, res, next){
        
        passport.authenticate('local-register', {
            successRedirect: '/auth/login',
            failureRedirect: '/auth/register'
        })(req, res, next)
    }
}




module.exports = new RegisterController();
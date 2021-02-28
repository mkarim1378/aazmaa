const Controller = require('./../controller')
const pasport = require('passport');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../../../models/user');

class LoginController extends Controller{

    index(req, res, next){
        return res.render('auth/login', {
            errors: req.flash('errors')
        });
    }
    googleLogin(req, res, next){
        passport.authenticate('google', {scope: ['profile', 'email']})(req, res, next)
    }
    googleLoginCalback(req, res, next){
        passport.authenticate('google', {failureRedirect: '/auth/login', successRedirect: '/'})(req, res, next)
    }
    async login(req, res, next){
        const result = await this.validateForm(req);
        if(result){
            this.loginProcess(req, res, next);
        }else{
            return this.back(req, res);
        }
    }
    loginProcess(req, res, next){
        passport.authenticate('local-login', (error, user) => {
            if(!user){
                return this.back(req, res);
            }
            req.login(user, err => {
                if(err){
                    console.log(err);
                    return this.back(req, res);
                }
                user.setToken(res);    
                return res.redirect('/');
                
            });
            
            
        })(req, res, next);
    }
}




module.exports = new LoginController();
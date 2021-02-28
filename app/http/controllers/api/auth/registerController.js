const Controller = require('../../controller');
const passport = require('passport');

class RegisterController extends Controller {
    registerView(req, res, next){
        return res.json('registering....');
    }
    register(req, res, next){
        passport.authenticate('api-register', {
            successRedirect: '/api',
            failureRedirect: '/api'
        })(req, res, next);
    }
}

module.exports = new RegisterController();
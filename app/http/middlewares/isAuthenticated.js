const Middleware = require('./middleware');
const helper = require('../../helper/helperFunctions');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');
const config = require('../../config/index');

class IsAuthenticated extends Middleware{
    async handle(req, res, next){
        
        if(!req.isAuthenticated()){
            return res.redirect('/auth/login');
        }
        
        next();
    }
}



module.exports = new IsAuthenticated();
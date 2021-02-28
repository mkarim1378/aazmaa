const Middleware = require('./middleware');

class AuthenticatedRedirect extends Middleware{
    handle(req, res, next){
        let token = req.signedCookies.aazmaa_access_token;
        
        if(req.isAuthenticated() && token && req.user && req.user.verifyToken(token)){
            return res.redirect(req.header('Referer') || '/');
        }
        next();
    }
}


module.exports = new AuthenticatedRedirect();
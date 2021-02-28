const Middleware = require('../middleware');
const User = require('../../../models/user');

class IsAuthenticated extends Middleware {
    async handle(req, res, next){
        let chatId = req.query.chatId;
        let user = await User.findOne({chatId});
        console.log('user ', user);
        if(!user){
            return res.redirect('/api/auth/register');
        }
        next();
    }
}

module.exports = new IsAuthenticated();
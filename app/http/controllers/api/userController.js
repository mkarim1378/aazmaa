const Controller = require('../controller');
const User = require('../../../models/user');
const Student = require('../../../models/student');

class UserController extends Controller {
 
    async authCheck(req, res, next){
        let user = null;
        let student = null;
        try{
            user = await User.findOne({chatId: req.params.chatId});
            student = await Student.findOne({chatId: req.params.chatId});
             
            if(!user && !student){
                return res.json({
                    error: false, 
                    message: 'not authenticated',
                    state: false
                });
            }else{
                
                return res.json({
                    error: false,
                    message: 'authenticated',
                    state: true,
                    type: student ? 'student' : 'teacher'
                })
            }
        }catch(ex){
            return res.json({
                message: 'some error happend while fetching user',
                error: true,
                content: ex,
                state: 'error'
            });
        }
    }
    addClass(req, res, next){
        return res.json('add class');
    }
}


module.exports = new UserController();
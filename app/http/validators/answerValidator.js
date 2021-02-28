const {check} = require('express-validator');

class AnswerValidator {
    handle(){
        return [
            check('answer').not().isEmpty().withMessage('لطفا پاسخ را وارد کنید')
        ]
    }
}


module.exports = new AnswerValidator();
const { check } = require('express-validator');

class PracticeValidator {
    handle(){
        return [
            check('title').not().isEmpty().withMessage('عنوان تمرین نمیتواند خالی باشد')
            // check('deadlineDate').not().isEmpty().withMessage('تاریخ و ساعت مهلت تمرین را وارد کنید')
        ]
    }
}

module.exports = new PracticeValidator();
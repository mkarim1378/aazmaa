const { check } = require('express-validator');

class CategoryValidator {
    handle(){
        return [
            check('title').not().isEmpty().withMessage('عنوان نمی تواند خالی باشد')
        ];
    }
}

module.exports = new CategoryValidator();
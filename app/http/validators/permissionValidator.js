const { check } = require('express-validator');

class PermissionValidator {
    handle(){
        return [
            check('name').not().isEmpty().withMessage('نام مجوز نمی تواند خالی باشد'),
            check('label').not().isEmpty().withMessage('برچسب مجوز نمی تواند خالی باشد')
        ];
    }
}


module.exports = new PermissionValidator();
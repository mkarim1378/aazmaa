const { check } = require('express-validator');

class UserValidator {
    handle(){
        return [
            check('name').not().isEmpty().withMessage('نام کاربر نمی تواند خالی باشد'),
            check('family').not().isEmpty().withMessage('نام خانوادگی کاربر نمی تواند خالی باشد'),
            check('phoneNumber').not().isEmpty().withMessage('شماره تلفن کاربر نمی تواند خالی باشد'),
            check('nationalCode').not().isEmpty().withMessage('کد ملی کاربر نمی تواند خالی باشد'),
            check('role').custom(async(role, {req}) => {
                role = role.split(',');
                console.log(role);
                if(!role || !!!role.length){
                    throw new Error('حداقل یک سطح دسترسی انتخاب کنید')
                }
                return;
            })
        ]
    }
}


module.exports = new UserValidator();
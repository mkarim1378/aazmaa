const { check } = require('express-validator');
const helper = require('../../helper/helperFunctions');

class LoginValidator {
    handle() {
        return [
            check('username').custom(async(data, {req}) => {
                if(!data){
                    throw new Error('لطفا کد ملی را وارد کنید');
                }
                if(!helper.nationalCodeVerify(data)){
                    throw new Error('کدملی معتبر نیست')
                }
                
            }),
            check('password').not().isEmpty().withMessage('رمز عبور را وارد کنید')
        ];
    }
}


module.exports = new LoginValidator();
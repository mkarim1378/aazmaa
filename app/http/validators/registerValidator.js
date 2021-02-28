const { check }  = require('express-validator');
const helper = require('../../helper/helperFunctions');

class RegisterValidator {
    handle(){
        return [
            check('phoneNumber').isMobilePhone().withMessage('لطفا شماره تلفن همران را صحیح وارد کنید'),
            check('nationalCode').custom(async(data, {req}) => {
                if(!data){
                    throw new Error('لطفا کد ملی را وارد کنید');
                }
                if(!helper.nationalCodeVerify(data)){
                    throw new Error('کدملی معتبر نیست')
                }
                
            })
        ];
    }
}

module.exports = new RegisterValidator();
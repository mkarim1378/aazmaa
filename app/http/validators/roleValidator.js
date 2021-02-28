const { check } = require('express-validator');

class RoleValidator{
    handle(){
        return [
            check('name').not().isEmpty().withMessage('نام سطح دسترسی نمی تواند خالی باشد'),
            check('permissions').custom(async (permissions, {req}) => {
                permissions = permissions.split(',');
                if(!permissions || !!!permissions.length){
                    throw new Error('حداقل یک مجوز انتخاب کنید');
                }
                return;
            })
        ]
    }
}

module.exports = new RoleValidator();
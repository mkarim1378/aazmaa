const { check } = require('express-validator');

class NotificationValidator { 
    handle(){
        return [
            check('title').not().isEmpty().withMessage('عنوان اطلاعیه نمی تواند خالی باشد'),
            check('body').not().isEmpty().withMessage('توضیحات اطلاعیه نمی تواند خالی باشد'),
            check('date').not().isEmpty().withMessage('تاریخ اطلاعیه را وارد کنید')
        ];
    }
}



module.exports = new NotificationValidator();
const { check } = require('express-validator');
const helper = require('../../helper/helperFunctions');

class ExamValidator {
    handle() {
        return [
            check('title').not().isEmpty().withMessage('عنوان آزمون نمی تواند خالی باشد'),
            check('level').custom(async (data) => {
                if (!data || data === 'undefined') {
                    throw new Error('لطفا حداقل یک مقطع تحصیلی انتخاب کنید')
                } else {
                    return;
                }
            }),
            check('date1').custom(async (date, { req }) => {
                if(!date) throw new Error('فرمت تاریخ معتبر نیست');

                // var myRegex = /^(\d{4})([\-\/])(\d{1,2})\2(\d{1,2})$/;

                // var match = myRegex.exec(helper.convertPersianDigitsToEnglish(date.split('-')[0]));

                // if (!match) {
                //     throw new Error('فرمت تاریخ معتبر نیست');
                // }
                // var timeRegex = /(?:[01]\d|2[0123]):(?:[012345]\d)/gm;
                // var timeMatch = timeRegex.exec(helper.convertPersianDigitsToEnglish(date.split('-')[1]));
                // if (!timeMatch) {
                //     throw new Error('فرمت زمان معتبر نیست');
                // }
            }),
            check('date2').custom(async (date, { req }) => {
                if(!date) throw new Error('فرمت تاریخ معتبر نیست');
                // var myRegex = /^(\d{4})([\-\/])(\d{1,2})\2(\d{1,2})$/;

                // var match = myRegex.exec(helper.convertPersianDigitsToEnglish(date.split('-')[0]));

                // if (!match) {
                //     throw new Error('فرمت تاریخ معتبر نیست');
                // }
                // var timeRegex = /(?:[01]\d|2[0123]):(?:[012345]\d)/gm;
                // var timeMatch = timeRegex.exec(helper.convertPersianDigitsToEnglish(date.split('-')[1]));
                // if (!timeMatch) {
                //     throw new Error('فرمت زمان معتبر نیست');
                // }
                // if(date < req.body.date1){
                //     throw new Error('تاریخ اتمام نمیتواند قبل از تاریخ برگزاری باشد');
                // }
            })
        ]
    }
}

module.exports = new ExamValidator();
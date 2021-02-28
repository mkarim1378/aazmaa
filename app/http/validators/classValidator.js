const { check } = require('express-validator');

class ClassValidator { 
    handle(req){
        return [
            check('title').not().isEmpty().withMessage('عنوان کلاس نمی تواند خالی باشد'),
            check('capacity').not().isEmpty().withMessage('ظرفیت کلاس نمی تواند خالی باشد'),
            check('place').not().isEmpty().withMessage('مشخص کنید کلاس را برای کجا ایجاد میکنید'),
            check('educationYear').custom(async(data, {req}) => {
                if(req.body.place === 'school' || req.body.place === 'university'){
                    if(!data){
                        
                        throw new Error('سال تحصیلی را انتخاب کنید');
                    }
                    return;
                }else{
                    return;
                }
            }),
            check('term').custom(async(data, {req}) => {
                if(req.body.place === 'university'){
                    if(!data){
                        throw new Error('لطفا ترم تحصیلی را انتخاب کنید');
                    }
                    return;
                }else{
                    return;
                }
            }),
            check('month').custom(async(data, {req}) => {
                if(req.body.place === 'institute' || req.body.place === 'personal'){
                    if(!data){
                        throw new Error('لطفا ماه را انتخاب کنید');
                    }
                    return;
                }
                return;
            }),
            check('year').custom(async (data, {req}) => {
                if(req.body.place === 'institute' || req.body.place === 'personal'){
                    if(!data){
                        throw new Error('لطفا سال را انتخاب کنید');
                    }
                    return;
                }
                return;
            })
        ]
        

    }
}

module.exports = new ClassValidator();
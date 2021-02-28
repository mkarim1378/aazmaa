const { check } = require('express-validator');
const fs = require('fs');
const path = require('path');
const Exam = require('../../models/exam');
const Question = require('../../models/question');

class QuestionValidator {
    handle() {
        return [
            check('question').not().isEmpty().withMessage('صورت سوال نمی تواند خالی باشد'),
            check('questionType').not().isEmpty().withMessage('نوع سوال را وارد کنید'),
            check('mediaType').not().isEmpty().withMessage('نوع مدیای سوال را وارد کنید'),
            check('options').custom(async (data, { req }) => {
                if (req.body.questionType === '4-options') {
                    if (data.length == 0 || data.includes('')) {
                        throw new Error('گزینه های سوال را کامل وارد کنید')
                    }
                    return;
                }
                return;
            }),
            check('media').custom(async (data, { req }) => {
                if((req.body.mediaType === 'none') || (req.body.hasMedia == 'true')){
                    return;
                }
                
                if (!data) {
                    throw new Error('فایل را انتخاب کنید')
                }
                
                let mediaType = req.body.mediaType;
                let fileExt = path.extname(data);
                let videoExt = ['.mp4', '.flv', '.avi', '.viv', '.mpg', '.svi', '.3gp',];
                let audioExt = ['.3gp', '.aac', '.m4a', '.mp3', '.ogg', '.oga', '.wav', '.wmv'];
                let imageExt = ['.jpg', '.jpeg', '.svg', '.png'];
                let documentExt = [
                    '.pdf', 
                    '.doc', 
                    '.docm', 
                    '.docx', 
                    '.dot', 
                    '.txt', 
                    '.java', 
                    '.cpp', 
                    '.cc', 
                    '.cs', 
                    '.py',
                    '.js',
                    '.ts',
                    '.json',
                    '.css',
                    '.html'
                ];
                
                switch (mediaType) {
                    case 'audio': {
                        if (!audioExt.includes(fileExt)) {
                            throw new Error('فایل انتخابی صوتی نیست')
                        } else {
                            return;
                        }
                    }
                    case 'video': {
                        if (!videoExt.includes(fileExt)) {
                            throw new Error('فایل انتخابی ویدیو نیست')
                        } else {
                            return;
                        }
                    }
                    case 'image': {
                        if (!imageExt.includes(fileExt)) {
                            throw new Error('فایل انتخابی تصویر نیست')
                        } else {
                            return;
                        }
                    }
                    case 'document': {
                        if (!documentExt.includes(fileExt)) {
                            throw new Error('فایل انتخابی سند نیست')
                        } else {
                            return;
                        }
                    }
                    default: {
                        throw new Error('پسوند فایل پشتیبانی نمی شود');
                    }
                }
            })
        ];
    }
}

module.exports = new QuestionValidator();
const express = require('express');
const router = express.Router();

//================================controllers=================================
const classController = require('../../http/controllers/classController');
const examController = require('../../http/controllers/examController');
const answerController = require('../../http/controllers/answerController');
//===================================validator+===============================
const answerValidator = require('../../http/validators/answerValidator');
//================================others======================================

const answerUploads = require('../../uploads/answerUpload');



//========================================class================================
router.get('/class/list', classController.studentClassList);
router.post('/class/join', classController.joinClass);
router.get('/class/left/:classId', classController.leftClass);
//=====================================exam====================================
router.get('/exam/list', examController.studentExamList);
router.post('/exam/join', examController.joinExam);
router.get('/exam/left/:examId', examController.leftExam);
router.get('/exam/:examId', examController.examSinglePage);

//===================================answer====================================
router.post('/answer', answerUploads.single('file'),(req, res, next) => {
    if(req.file){
        req.body.file = req.file.filename;
    }
    next();
}, answerController.answer);
router.get('/answer/delete/:id', answerController.destroy);
router.get('/answer/download/:answerId', answerController.download);
router.post('/answer/correction/:answerId', answerController.correction);
router.post('/answer/correction/changeGrade/:studentId/:examId', answerController.changeGrade);
router.get('/answers/:studentId/:examId', answerController.answers);
router.get('/answer/correction/delete/:answerId', answerController.deleteCorrection);
module.exports = router;
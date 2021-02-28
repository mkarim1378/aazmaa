const io = require('socket.io')(8080);
const progressStream = require('progress-stream');
const express = require('express');
const router = express.Router();
//=====================controllers=============================
const studentController = require('../../http/controllers/studentController');
const examController = require('../../http/controllers/examController');
const questionController = require('../../http/controllers/questionController');
const classController = require('../../http/controllers/classController');
const practiceController = require('../../http/controllers/practiceController');
const roleController = require('../../http/controllers/roleController');
const userController = require('../../http/controllers/userController');
const notificationController = require('../../http/controllers/notificationController');
const permissionController = require('../../http/controllers/permissionController');
const categoryController = require('../../http/controllers/categoryController');
//======================validator==============================
const examValidator = require('../../http/validators/examValidator');
const classValidator = require('../../http/validators/classValidator');
const questionValidator = require('../../http/validators/questionValidator');
const practiceValidator = require('../../http/validators/practiceValidator');
const permissionValidator = require('../../http/validators/permissionValidator');
const roleValidator = require('../../http/validators/roleValidator');
const userValidator = require('../../http/validators/userValidator');
const notificationValidator = require('../../http/validators/notificationValidator');
const categoryValidator = require('../../http/validators/categoryValidator');
//======================others=================================
const questionUpload = require('../../uploads/questionUpload');
const classUpload = require('../../uploads/classUpload');
const practiceUpload = require('../../uploads/practiceUpload');
const profileUpload = require('../../uploads/profileUploads');
const notificationUpload = require('../../uploads/notificationUpload');
const categoryUpload = require('../../uploads/categoryUpload');
//=====================middlewares=============================
const canAccess = require('./../../http/middlewares/canAccess');
//=========================routes==============================
const studentRoutes = require('./student');


router.use('/student', studentRoutes);

//======================================students===================================
router.get('/students',canAccess.handle('students'), studentController.panelStudentList);
//=====================================exams======================================
router.get('/exam/create',canAccess.handle('exam'), examController.createPage);
router.post('/exam/create',canAccess.handle('exam'),  examValidator.handle(), examController.create);
router.get('/exam/list',canAccess.handle('exam'), examController.examList);
router.get('/exam/delete/:examId',canAccess.handle('exam'),  examController.destroy);
router.get('/exam/edit/:examId',canAccess.handle('exam'),  examController.editPage)
router.post('/exam/edit/:examId',canAccess.handle('exam'),  examValidator.handle(), examController.edit);
router.get('/exam/correction/:examId', canAccess.handle('exam'), examController.correctionPage);
router.get('/exam/export/pdf/:examId', examController.exportPdf);
router.post('/exam/clone/:examId', canAccess.handle('exam'), examController.clone);
router.get('/exam/addQuestion/:examId', canAccess.handle('exam'), examController.activateAddQuestionMode);
router.get('/exam/questions/:examId', canAccess.handle('exam'), examController.questions);
//=====================================questions======================================
router.get('/question/create',canAccess.handle('question'), questionController.createPage);
router.post('/question/create',canAccess.handle('question'),questionUpload.single('media'), (req, res, next) => {
    if (req.file) {
        req.body.media = req.file.filename;
    }
    next();
}, questionValidator.handle(), questionController.create);
router.get('/question/delete/:questionId',canAccess.handle('question'), questionController.destroy);
router.get('/question/removeFromExam/:questionId/:examId', canAccess.handle('question'), questionController.removeFromExam);
router.get('/question/list',canAccess.handle('question'), questionController.questionList);
router.get('/question/edit/:questionId',canAccess.handle('question'), questionController.editPage);
router.post('/question/edit/:questionId', canAccess.handle('question'), questionUpload.single('media'), (req, res, next) => {
    if (req.file) {
        req.body.media = req.file.filename;
    }
    
    next();
}, questionValidator.handle(), questionController.edit);
router.get('/question/download/:questionId', canAccess.handle('question'), questionController.download);
router.post('/question/addToExam', canAccess.handle('question'), questionController.addToExam);
//=====================================claeeses======================================
router.get('/class/create',canAccess.handle('class'), classController.createPage);
router.post('/class/create',canAccess.handle('class'), classUpload.single('image'), (req, res, next) =>{
    if(req.file){
        req.body.image = req.file.filename;
    }
    
    next();
}, classValidator.handle(), classController.create);
router.get('/class/list', canAccess.handle('class'), classController.classList);
router.get('/class/delete/:classId', canAccess.handle('class'), classController.destroy);
router.get('/class/:classId', canAccess.handle('class', 'student-class'), classController.singlePage);
router.get('/class/edit/:classId', canAccess.handle('class'), classController.editPage);
router.post('/class/edit/:classId', canAccess.handle('class'), classUpload.single('image'), (req, res, next) =>{
    if(req.file){
        req.body.image = req.file.filename;
    }
    next();
}, classValidator.handle(), classController.edit);
router.post('/class/addExam', canAccess.handle('class'), classController.addExam);
//=============================================practice==========================================
router.post('/practice/add',canAccess.handle('practice'),practiceUpload.single('file'), (req, res, next) => {

    if(req.file){
        req.body.file = req.file.filename;
    }
    
    next();
}, practiceValidator.handle(), practiceController.addPractice);
router.get('/practice/delete/:practiceId',canAccess.handle('practice'), practiceController.destroy);
router.get('/practice/download/:slug', canAccess.handle('practice'),practiceController.download);

//=============================================notification=======================================
router.post('/notification/add',   canAccess.handle('notification'), notificationUpload.single('file'),  canAccess.handle('notification'),notificationValidator.handle(), notificationController.add);
router.get('/notification/delete/:notificationId',  canAccess.handle('notification'),  notificationController.destroy);
router.get('/notification/download/:slug', canAccess.handle('notification'), notificationController.download);
//==============================================permission========================================
router.get('/permissions',  canAccess.handle('permission'), permissionController.index);
router.get('/permission/add', canAccess.handle('permission'),  permissionController.addPage);
router.post('/permission/add', canAccess.handle('permission'),  permissionValidator.handle(), permissionController.add);
router.get('/permission/delete/:permissionId', canAccess.handle('permission'),  permissionController.destroy);
router.get('/permission/edit/:permissionId', canAccess.handle('permission'),  permissionController.editPage);
router.post('/permission/edit/:permissionId', canAccess.handle('permission'),  permissionController.edit);
//===============================================roles===========================================
router.get('/roles',  canAccess.handle('role'), roleController.index);
router.get('/role/add', canAccess.handle('role'), roleController.addPage);
router.post('/role/add', canAccess.handle('role'),roleValidator.handle(), roleController.add);
router.get('/role/edit/:roleId', canAccess.handle('role'),roleController.editPage);
router.post('/role/edit/:roleId', canAccess.handle('role'), roleValidator.handle(),roleController.edit);
//===============================================users==========================================
router.get('/users', canAccess.handle('user'),userController.index);
router.get('/user/edit/:userId', canAccess.handle('user'),userController.editPage);
router.post('/user/edit/:userId',canAccess.handle('user'),profileUpload.single('profile'),(req, res, next) => {
    if(req.file){
        req.body.profile = req.file.filename;
    }
    next();
} ,userValidator.handle(), userController.edit);
router.get('/user/delete/:userId', canAccess.handle('user'), userController.destroy);
//==================================================category======================================
router.post('/category/create',canAccess.handle('category'), categoryUpload.single('image'), categoryValidator.handle(), categoryController.create);
router.get('/category/withoutCategory', canAccess.handle('category'), categoryController.withoutCategory);
router.get('/category/questions/:categoryId', canAccess.handle('category'), categoryController.questions);


module.exports = router;

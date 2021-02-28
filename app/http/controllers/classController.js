const Controller = require('./controller');
const Practice = require('../../models/practice');
const Class = require('../../models/class');
const Notification = require('../../models/notification');
const helper = require('../../helper/helperFunctions');
const student_class = require('../../models/conjuctions/student_class');
const fs = require('fs');
const User = require('../../models/user');
const teacher_exam = require('../../models/conjuctions/teacher_exam');
const Exam = require('../../models/exam');
const exam_class = require('../../models/conjuctions/exam_class');

class ClassController extends Controller {
    createPage(req, res, next) {
        return res.render('class/class_create', {
            path: 'classes',
            errors: req.flash('errors'),
            success: req.flash('success'),
            educationYear: {
                from: 1399,
                to: 1420
            }
        })
    }
    async create(req, res, next) {
        const result = await this.validateForm(req);
        if (result) {
            this.createProcess(req, res, next);
        } else {
            if (req.file) {
                fs.unlinkSync(`./public${req.file.destination}/${req.file.filename}`.substring(8));
            }
            return this.back(req, res);
        }
    }
    async createProcess(req, res, next) {
        let image = '';
        if (req.file) {
            image = `${req.file.destination}/${req.file.filename}`.substring(8);
        }
        let code = await helper.generateClassUniqueCode();
        let newClass = new Class({
            title: req.body.title,
            teacher: req.user._id,
            capacity: req.body.capacity,
            description: req.body.description || '',
            year: req.body.year || '',
            place: req.body.place,
            educationYear: req.body.educationYear || '',
            term: req.body.term || '',
            image,
            code
        })
        try {
            await newClass.save();
        } catch (ex) {
            req.flash('errors', 'مشکلی در ذخیره کلاس پیش آمد')
            return this.back(req, res);
        }
        req.flash('success', 'کلاس با موفقیت ثبت شد');
        return res.redirect('/panel/class/list');
    }
    async classList(req, res, next) {
        let classes = null;
        let finalClasses = [];
        let search = req.query.search || '';
        let filter = req.query.filter || ''

        if (search) {
            search = helper.convertPersianDigitsToEnglish(search);
        }
        try {
            classes = await Class.find({
                $and: [
                    {
                        $or: [
                            {title: {$regex: search}},
                            {year: {$regex: search}},
                            {educationYear:{$regex: search}}
                        ],
                    },
                    {
                        teacher: req.user._id,
                    },
                    {
                        term: {$regex: (filter == 'odd' || filter == 'even') ? filter : ''}
                    }
                ]
            }).sort({educationYear: filter == 'eduYearDec' ? -1 : 1});
            for(let _class of classes){
                let students = await student_class.getAllStudentsForSingleClass(_class._id)
                
                finalClasses.push({_class, studentCount: students.length});
            }
            
            
            
        } catch (ex) {
            console.log(ex);
            req.flash('errors', 'خطایی در بازگردانی لیست کلاس ها رخ داد')
            return this.back(req, res);
        }

        return res.render('class/class_list', {
            classes: finalClasses,
            path: 'classes',
            errors: req.flash('errors'),
            success: req.flash('success'),
            search,
            filter,
            helper
        })
    }

    async destroy(req, res, next) {
        let _class = null;
        try {
            _class = await Class.findById(req.params.classId);
            let filePath = `./public${_class.image}`;

            if (_class.image && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            await _class.remove();
        } catch (ex) {
            req.flash('errors', 'خطایی در حذف کلاس رخ داد');
            return this.back(req, res);
        }
        return this.back(req, res);
    }
    async addExam(req, res, next) {
        let { exams, classId } = req.body;
        exams = exams.split(',');
        
        try {
            for (let exam of exams) {
                let examClass = await exam_class.model.findOne({ exam, classId });
                if (!examClass) {
                    let newExamClass = new exam_class.model({
                        exam,
                        classId
                    });
                    await newExamClass.save();
                }
            }
        } catch (ex) {
            console.log(ex);
            req.flash('errors', 'خطایی در ثبت آزمون ها رخ داد');
        }
        return this.back(req, res);

    }
    async singlePage(req, res, next) {
        let _class = null;
        let practices = null;
        let notifications = null;
        let exams = null;
        let selectedExams = null
        let { classId } = req.params;
        try {
            _class = await Class.findById(classId);
            practices = await Practice.find({ classId: _class._id }).populate([
                {
                    path: 'classId',
                    populate: {
                        path: 'teacher'
                    }
                }
            ]);
            notifications = await Notification.find({ classId: _class._id }).populate([
                {
                    path: 'classId',
                    populate: {
                        path: 'teacher'
                    }
                }
            ])
            exams = await teacher_exam.getExamsForSingleTeacher(req.user._id);
            selectedExams = await exam_class.getAllExamsForSingleClass(classId);
            let students = await student_class.getAllStudentsForSingleClass(classId);
            return res.render('class/singlePage', {
                _class,
                practices,
                notifications,
                path: 'classes',
                errors: req.flash('errors'),
                success: req.flash('success'),
                helper,
                students,
                exams: JSON.stringify(exams),
                selectedExams: JSON.stringify(selectedExams)
            })
        } catch (ex) {
            console.log(ex);
            req.flash('errors', 'خطایی در یافتن کلاس رخ داد');
            return this.back(req, res);
        }
    }
    async editPage(req, res, next) {
        let _class = null;
        let { classId } = req.params;
        try {
            _class = await Class.findById(classId);
            return res.render('class/editPage', {
                _class,
                educationYear: {
                    from: 1399,
                    to: 1420
                },
                path: 'clesses',
                errors: req.flash('errors'),
                success: req.flash('success')
            })
        } catch (ex) {
            req.flash('errors', 'خطایی در یافتن کلاس رخ داد');
            return this.back(req, res);
        }
    }

    async edit(req, res, next) {
        let result = await this.validateForm(req);

        if (result) {
            this.editProcess(req, res, next);
        } else {
            return this.back(req, res);
        }
    }
    async editProcess(req, res, next) {
        const { classId } = req.params;
        let _class = null;
        try {
            _class = await Class.findById(classId);
        } catch (ex) {
            req.flash('errors', 'خطایی در یافتن کلاس رخ داد');
            return this.back(req, res);
        }
        let image = _class.image;
        if (req.file) {
            image = `${req.file.destination}/${req.file.filename}`.substring(8);
        }

        let teacher = req.user._id;
        let {
            title,
            capacity,
            description,
            year,
            place,
            educationYear,
            term
        } = req.body;
        try {
            await Class.findByIdAndUpdate(classId, {
                title,
                teacher,
                capacity,
                desciprtion: description || '',
                year: year || '',
                place,
                educationYear: educationYear || '',
                term: term || '',
                image
            })
        } catch (ex) {
            req.flash('errors', 'خطایی در ویرایش کلاس رخ داد');
            return this.back(req, res);
        }
        req.flash('success', 'عملیات ویرایش با موفقیت انجام شد')
        return res.redirect('/panel/class/list');
    }
    async studentClassList(req, res, next) {
        try {
            let classes = await student_class.getAllClassesForSingleStudent(req.user._id);

            return res.render('class/studentClassList', {
                path: 'studentClasses',
                errors: req.flash('errors'),
                success: req.flash('success'),
                classes
            });
        } catch (ex) {
            req.flash('errors', 'خطایی در بازگردانی لیست کلاس ها رخ داد');
            return this.back(req, res);
        }
    }
    async joinClass(req, res, next) {
        let { code } = req.body;


        try {
            let _class = await Class.findOne({ code });
            if (!_class) {
                req.flash('errors', 'کلاس یافت نشد');
            } else if (await student_class.isStudentInClass(req.user._id, _class.id)) {
                req.flash('errors', 'قبلا در این کلاس شرکت کرده اید');
            } else {
                let newStudentClass = new student_class.model({
                    student: req.user._id,
                    classId: _class._id
                });
                await newStudentClass.save();
            }

        } catch (ex) {
            req.flash('errors', 'خطایی در پیوستن به کلاس رخ داد');
        }
        return this.back(req, res);
    }
    async leftClass(req, res, next) {
        let { classId } = req.params;
        try {
            let _class = await Class.findById(classId);
            if (student_class.isStudentInClass(req.user._id, classId)) {
                let studentClass = await student_class.model.findOne({
                    $and: [
                        {
                            classId,
                            student: req.user._id
                        }
                    ]
                })
                await studentClass.remove();
            } else {
                req.flash('errors', 'شما عضو این کلاس نیستید');
            }
        } catch (ex) {
            req.flash('errors', 'خطایی در خروج از کلاس رخ داد');
        }
        return this.back(req, res);
    }
}


module.exports = new ClassController();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const Student = require('../models/student');
const Role = require('../models/role');
const Permission = require('../models/permission');
const {getGender} = require("persian-gender-detection");
const helper = require('../helper/helperFunctions');

passport.serializeUser(function (user, done) {
    done(null, user.id);
    // where is this user.id going? Are we supposed to access this anywhere?
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use('local-register', new LocalStrategy({
    usernameField: 'phoneNumber',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, phoneNumber, password, done) => {
    
    let user = null;
    
    try {
        user = await User.findOne({ phoneNumber });
        
        if (user) {
            return done(null, false, req.flash('errors', 'کاربری با این شماره تلفن   قبلا ثبت نام کرده است'));
        }
        let gender = getGender(req.body.name);
        let profile = '';
        if(gender == 'MALE'){
            profile = '/images/icons/person.png';
        }else if(gender == 'FEMALE'){
            profile = '/images/icons/girl.png';
        }
        user = new User({
            email: req.body.email || '',
            password: req.body.nationalCode,
            name: req.body.name,
            family: req.body.family,
            nationalCode: helper.faDigitsToEn(req.body.nationalCode),
            phoneNumber: helper.faDigitsToEn(req.body.phoneNumber),
            type: req.body.type,
            profile
        });
        // switch (req.body.type) {
        //     case 'student': {
        //         let studentRole = await Role.findOne({ name: 'student' });
        //         user.role.push(studentRole._id);
        //         break;
        //     }
        //     case 'teacher': {
        //         let teacherRole = await Role.findOne({ name: 'teacher' });
        //         user.role.push(teacherRole._id);
        //         break;
        //     }
        //     case 'institute': {
        //         let instituteRole = await Role.findOne({ name: 'institute' });
        //         user.role.push(instituteRole._id);
        //         break;
        //     }
        //     case 'university': {
        //         let universityRole = await Role.findOne({ name: 'university' });
        //         user.role.push(universityRole._id);
        //         break;
        //     }
        // }
        await user.save();
        
        return done(null, user);
    } catch (ex) {
        
        return done(ex, false, req.flash('errors', 'خطایی  در عملیات ثبت نام رخ داد'));
    }
}));

passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    let user = null;
    user = await User.findOne({ nationalCode: username });
    if (!user) {
        return done(null, false, req.flash('errors', 'کاربری با این مشخصات یافت نشد'));
    }
    if (!user.comparePassword(password)) {
        return done(null, false, req.flash('errors', 'رمز عبور اشتباه است'));
    }
    return done(null, user);

}));


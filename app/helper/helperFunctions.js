const Exam = require('../models/exam');
const Role = require('../models/role');
const Class = require('../models/class');
const Permission = require('../models/permission');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const axios = require('axios').default;
const moment = require('moment-jalaali');

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true });

module.exports.convertPersianDigitsToEnglish = function (data) {
    let str = data;
    if (!data) return '';
    var e = '۰'.charCodeAt(0);
    str = str.replace(/[۰-۹]/g, function (t) {
        return t.charCodeAt(0) - e;
    });

    e = '٠'.charCodeAt(0);
    str = str.replace(/[٠-٩]/g, function (t) {
        return t.charCodeAt(0) - e;
    });
    return str;
}
module.exports.convertEnglishDigitsToPersian = function (data) {
    if (!data) return '';
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

    return data
        .toString()
        .replace(/\d/g, x => farsiDigits[x]);
}

module.exports.enDigitsToFa = module.exports.convertEnglishDigitsToPersian;
module.exports.faDigitsToEn = module.exports.convertPersianDigitsToEnglish;

module.exports.isExamUniqueCodeRepetitive = async function (str) {
    let exams = await Exam.find({ finished: false });
    for (let exam of exams) {
        let code = exam.code.split('-')[1];
        if (str === code) {
            return true;
        }
    }
    return false;
}

module.exports.isClassUniqueCodeRepetitive = async function (str) {
    let classes = await Class.find({});
    for (let _class of classes) {
        let code = _class.code.split('-')[1];
        if (str === code) {
            return true;
        }
    }
    return false;
}
module.exports.generateExamUniqueCode = async function (date) {
    let year = date.split('-')[0].split('/')[0];
    let month = date.split('-')[0].split('/')[1];
    let day = date.split('-')[0].split('/')[2];
    let uniqueCode = (Math.floor(Math.random() * 90000) + 10000).toString();

    while (await module.exports.isExamUniqueCodeRepetitive(uniqueCode)) {
        uniqueCode = (Math.floor(Math.random() * 90000) + 10000).toString();
    }
    let code = `exam${year}${month}${day}-${uniqueCode}`;
    return code
}
module.exports.generateClassUniqueCode = async function () {
    let uniqueCode = (Math.floor(Math.random() * 90000) + 10000).toString();
    while (await module.exports.isClassUniqueCodeRepetitive(uniqueCode)) {
        uniqueCode = (Math.floor(Math.random() * 90000) + 10000).toString();
    }
    let code = `class${uniqueCode}`;
    return code
}
module.exports.roleHasPermission = async function (roleId, permissions) {

    let role = await Role.findById(roleId);

    for (let permissionId of role.permissions) {

        let permission = await Permission.findById(permissionId);

        if (permissions.includes(permission.name)) {
            return true;
        }
    }
    return false;
}

module.exports.verifyJwtToken = async function (token) {
    let obj = jwt.verify(token, config.statics.jwt.secret);
    let user = await User.findById(obj._id);
    return user._id == obj._id;
}
module.exports.convertLevelToString = function (levelNumber) {
    let levels = [
        'مهد کودک و پیش دبستانی',
        'دبستان',
        'متوسطه اول',
        'متوسطه دوم',
        'دانشگاه',
        'موسسات آموزشی',
        'سایر',
    ];
    return levels[levelNumber - 1];
}
module.exports.fullTime = function () {
    
    return {
        fa: moment(Date.now()).format('HH:MM:SS'),
        en: module.exports.convertPersianDigitsToEnglish(moment(Date.now()).format('HH:MM:SS'))
    };
}
module.exports.currentTime = async function () {
    try {

        //=========================================================================
        // let { data: res } = await axios.get('http://umbrella.shayan-soft.ir/tools/date_time/api/v1/gettime.php?type=jalali');
        // if(!res || !res.time){
        //     return {
        //         en: this.currentTime(),
        //         fa: this.enDigitsToFa(this.currentTime()),
        //         fullTime: {
        //             en: this.fullTime().en,
        //             fa: this.enDigitsToFa(this.fullTime().en)
        //         }
        //     }
        // }
        
        // let time = {};
        // time.en = `${res.time.hour24full}:${res.time.minutefull}`;
        // time.fa = module.exports.enDigitsToFa(time.en);
        // time.fullTime = {
        //     en: `${res.time.hour24full}:${res.time.minutefull}:${res.time.secondfull}`,
        //     fa: module.exports.enDigitsToFa(`${res.time.hour24full}:${res.time.minutefull}:${res.time.secondfull}`)
        // }
        // return time;
        //=========================================================================
        // let { data: res } = await axios.get('https://api.keybit.ir/time');

        // let time = {};
        // time.en = `${res.time24.full.en.split(':')[0]}:${res.time24.full.en.split(':')[1]}`;
        // time.fa = module.exports.enDigitsToFa(`${res.time24.full.en.split(':')[0]}:${res.time24.full.en.split(':')[1]}`);
        // time.fullTime = {
        //     en: res.time24.full.en,
        //     fa: module.exports.enDigitsToFa(res.time24.full.en)
        // };
        // return time;
        //=========================================================================
        let second = new Date().getSeconds();
        if(second < 10){
            second = `0${second}`;
        }
        let minute = new Date().getMinutes();
        if(minute < 10){
            minute = `0${minute}`;
        }
        let hour = new Date().getHours();
        if(hour < 10){
            hour = `0${hour}`;
        }
        return {
            fa: this.enDigitsToFa(`${hour}:${minute}`),
            en: `${hour}:${minute}`,
            fullTime: {
                fa: this.enDigitsToFa(`${hour}:${minute}:${second}`),
                en: `${hour}:${minute}:${second}`,
            }
        };
    } catch (ex) {
        console.log(ex);
        return '';
    }
}

module.exports.currentDate = async function () {
    try {

        // let { data: res } = await axios.get('http://umbrella.shayan-soft.ir/tools/date_time/api/v1/getdate.php?type=jalali');
        // let date = {};
        // date.en = `${res.year.num4}/${res.month.numfull}/${res.day.numfull}`;
        // date.fa = module.exports.enDigitsToFa(date.en);
        // return date;

        //============================================================
        // let { data: res } = await axios.get('https://api.keybit.ir/time');
        // let date = res.date.full.official.usual;
        // return date;
        //=============================================================
        return {
            fa: moment(Date.now()).format('jYYYY/jMM/jDD'),
            en: module.exports.faDigitsToEn(moment(Date.now()).format('jYYYY/jMM/jDD'))
        }
    } catch (ex) {

        return '';
    }
}

module.exports.systemTime = function () {
    return {
        fa: moment(Date.now()).format('HH:MM'),
        en: module.exports.convertPersianDigitsToEnglish(moment(Date.now()).format('HH:MM'))
    };
}
module.exports.systemDate = function () {
    return {
        fa: moment(Date.now()).format('jYYYY/jMM/jDD'),
        en: module.exports.faDigitsToEn(moment(Date.now()).format('jYYYY/jMM/jDD'))
    }
}
module.exports.isExamStarted = async function (examId) {
    try {
        let currentTime = (await module.exports.currentTime()).en || module.exports.systemTime().en;
        let currentDate = (await module.exports.currentDate()).en || module.exports.systemDate().en;
        let exam = await Exam.findById(examId);
        if (!exam) return null;
        if (currentDate >= exam.date1) {
            if ((currentTime == exam.time1) || (currentTime > exam.time1)) {
                return true;
            }
        }
        return false;
    } catch (ex) {
        console.log(ex);
        return null;
    }
}
module.exports.isExamEnded = async function (examId) {
    try {
        let exam = await Exam.findById(examId);
        if (!exam) return null;
        let currentDate = (await module.exports.currentDate()).en || (module.exports.systemDate()).en;
        let currentTime = (await module.exports.currentTime()).en || (module.exports.systemTime()).en;

        if ((currentDate > exam.date2) || ((currentDate == exam.date2) && (currentTime >= exam.time2))) {
            
            return true;

        } else {
            return false;
        }
    } catch (ex) {
        console.log(ex);
        return null;
    }
}

module.exports.nationalCodeVerify = function (code) {
    return true;
    if (code.length < 8 || code.length > 10) return false;
    let array = code.split('');
    if (code.length == 8) {
        array.unshift('0');
        array.unshift('0');
    }
    if (code.length == 9) {
        array.unshift('0');
    }
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += array[i] * (i + 1);
    }
    if (sum % 11 < 2) {
        if (array[array.length - 1] != 2) {
            return false;
        }
    } else {
        if (array[array.length - 1] != (11 - (sum % 11))) {
            return false;
        }
    }
    return true;
}


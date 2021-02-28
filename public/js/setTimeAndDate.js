convertPersianDigitsToEnglish = function (data) {
    let str = data;
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
convertEnglishDigitsToPersian = function (data) {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

    return data
        .toString()
        .replace(/\d/g, x => farsiDigits[x]);
}




async function myFunc() {
    try {
        let data = await fetch('https://cors-anywhere.herokuapp.com/http://umbrella.shayan-soft.ir/tools/date_time/api/v1/gettime.php?type=jalali');
        
        let res = await data.json();
        let time = {};
        time.en = `${res.time.hour24full}:${res.time.minutefull}:${res.time.secondfull}`;
        time.fa = convertEnglishDigitsToPersian(time.en);
        document.querySelector('#timer').textContent = `${time.fa}`;
        
    } catch (ex) {
        console.log(ex);
    }
}
setInterval(() => {
    let timer = convertPersianDigitsToEnglish(document.querySelector('#timer').textContent).split(':');

    let hour = +timer[0];
    let minute = +timer[1];
    let second = +timer[2];
    
    if(second == 59){
        second = -1;
        minute++;
    }
    if(minute == 59){
        minute = 0;
        hour++;
    }
    if(hour == 23){
        hour = 0;
    }
    second++;
    document.querySelector('#timer').textContent = convertEnglishDigitsToPersian(`${hour}:${minute}:${second}`);
}, 1000);


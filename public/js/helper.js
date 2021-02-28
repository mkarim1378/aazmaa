let convertPersianDigitsToEnglish = function (data) {
    let str = data;
    if (!data) return;
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
let convertEnglishDigitsToPersian = function (data) {
    if (!data) return;
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

    return data
        .toString()
        .replace(/\d/g, x => farsiDigits[x]);
}

enDigitsToFa = convertEnglishDigitsToPersian;
faDigitsToEn = convertPersianDigitsToEnglish;


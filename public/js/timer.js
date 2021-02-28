
(async () => {
    let socket = io('http://192.168.43.171:3000/timer');

    convertPersianDigitsToEnglish = function (data) {
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
    convertEnglishDigitsToPersian = function (data) {
        if (!data) return;
        const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

        return data
            .toString()
            .replace(/\d/g, x => farsiDigits[x]);
    }

    let progressBar = document.querySelector('.e-c-progress');
    let indicator = document.getElementById('e-indicator');
    let pointer = document.getElementById('e-pointer');
    let length = Math.PI * 2 * 100;
    let currentTime;
    let time2 = document.querySelector('#time2').value.split(':');
    let time1 = document.querySelector('#time1').value.split(':');
    let time2Seconds = getSeconds(time2);
    let time1Seconds = getSeconds(time1);

    let timeInterval = setInterval(async () => {
        socket.emit('getCurrentTime', {
            message: 'i want currnet time'
        })

        // let data = await fetch('https://cors-anywhere.herokuapp.com/https://api.keybit.ir/time');
        // let res = await data.json();
        // currentTime = res.time24.full.en.split(':');


    }, 1000);;

    function getSeconds(time) {
        if (time.length == 3) {
            let hour = +time[0];
            let minute = +time[1];
            let second = +time[2];
            return (hour * 3600) + (minute * 60) + second;
        } else if (time.length == 2) {
            let hour = +time[0];
            let minute = +time[1];
            return (hour * 3600) + (minute * 60);
        }
    }

    function update(value, timePercent) {
        var offset = - length - length * value / (timePercent);
        progressBar.style.strokeDashoffset = offset;
        pointer.style.transform = `rotate(${360 * value / (timePercent)}deg)`;

        let hour = Math.floor(value / 3600);
        let minute = Math.floor(((value % 3600) / 60))
        let second = Math.floor(value % 60);
        document.querySelector('#remain').textContent = convertEnglishDigitsToPersian(`${hour}:${minute}:${second}`)
    };
        
    socket.on('currentTime', data => {
        currentTime = data.time.en;
        progressBar.style.strokeDasharray = length;
        let wholeTime = time2Seconds - time1Seconds;
        let currentSeconds = getSeconds(currentTime.split(':'));
        
        if(currentSeconds >= time2Seconds || (ended == 'true')) {
            clearInterval(timeInterval)
            document.querySelector('#remain').textContent = convertEnglishDigitsToPersian(`0:0:0`)
            update(0, 1);
        }else{
            update(time2Seconds - currentSeconds, wholeTime);
        };
        
        
    })
    

})();
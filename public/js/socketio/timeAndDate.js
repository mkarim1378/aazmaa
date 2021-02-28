let socket = io('http://localhost:3000/timeAndDate')
let timer = document.querySelector('#timer');
let date = document.querySelector('#date');
try{

    socket.emit('getCurrentDate', {
        message: 'I eant current date'
    });
    socket.emit('getCurrentTime', {
        message: 'I want current time'
    })
    
    socket.on('currentTime', data => {
        
        timer.textContent = data.time.fullTime.fa;
    });
    
    let timerInterval = setInterval(() => {
        
        socket.emit('getCurrentTime', {
            message: 'I want current time'
        })
    }, 900);
}catch(ex){
    console.log(ex);
}
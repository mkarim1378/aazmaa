let uploadSocket = io('http://localhost:3000');
uploadSocket.on('percentage', percentage => {
    console.log(percentage);;
});
let uploadSocket = io('http://localhost:8080');
uploadSocket.on('percentage', percentage => {
    console.log(percentage);;
});
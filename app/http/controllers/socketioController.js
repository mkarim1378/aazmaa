const Controller = require('./controller');
const helper = require('../../helper/helperFunctions');
const socketio = require('socket.io');



class SocketioController extends Controller { 
    constructor(){
        super();
        this.io = null;
        this.timerNS = null;
        this.examNS = null;
        this.timeAndDateNS = null;
        this.classNS = null;
        
    }
    main(server){
        
        this.io = socketio(server);
        this.timer();
        this.exam();
        this.timeAndDate();
        this._class();
    }
    _class(){
        this.classNS = this.io.of('/class');
        let broadcaster = null;
        this.classNS.on('connection', socket =>  {
            console.log('connected');
            socket.on('broadcasting', ({broadcaster}) => {
                console.log('broadcasting');
                this.classNS.emit('broadcasting', {broadcaster});
            });

            socket.on('candidate', ({from, to, data, who}) => {
                console.log('candidate');
                this.classNS.to(to).emit('candidate', {to, from, data, who});
            });

            socket.on('offer', (data) => {
                console.log('offer');
                this.classNS.emit('offer', data);
            });

            socket.on('watch', ({watcher, to}) => {
                console.log('watch');
                this.classNS.emit('watch', {watcher})
            });
            socket.on('answer', ({from, to, description}) => {
                console.log('answer');
                this.classNS.to(to).emit('answer', {from, to, description});
            });

            // socket.on("broadcaster", () => {
            //     console.log('ddddddd');
            //     broadcaster = socket.id;
            //     socket.broadcast.emit("broadcaster");
            //   });
            //   socket.on("watcher", () => {
            //       console.log('dddddddddddddddddddddd');;
            //     socket.to(broadcaster).emit("watcher", socket.id);
            //   });
            //   socket.on("offer", (id, message) => {
            //     socket.to(id).emit("offer", socket.id, message);
            //   });
            //   socket.on("answer", (id, message) => {
            //     socket.to(id).emit("answer", socket.id, message);
            //   });
            //   socket.on("candidate", (id, message) => {
            //     socket.to(id).emit("candidate", socket.id, message);
            //   });
            //   socket.on("disconnect", () => {
            //     socket.to(broadcaster).emit("disconnectPeer", socket.id);
            //   });
        });
        
    }
    exam(){
        this.examNS = this.io.of('/exam');
        this.examNS.on('connection', socket => {
            socket.on('change', data => {
                
            });
        });
    }
    timeAndDate(){
        this.timeAndDateNS = this.io.of('/timeAndDate');
        this.timeAndDateNS.on('connection', socket => {
            socket.on('getCurrentTime', async data => {
                
                let currentTime = await helper.currentTime();
                
                socket.emit('currentTime', {
                    time: currentTime
                });
            });
            socket.on('getCurrentDate', async data => {
                let currentDate = await helper.currentDate();
                socket.emit('currentDate', {
                    date: currentDate
                });
            });
        });
    }
    timer(){
        this.timerNS = this.io.of('/timer');
        
        this.timerNS.on('connection', (socket) => {
            
            socket.on('getCurrentTime', async (data) => {
                let currentTime = await helper.currentTime()
                socket.emit('currentTime', {
                    time: currentTime.fullTime
                })
            })
        });
    }
    getNamespce(name){
        return this.io.of(`/${name}`);
    }
}



module.exports = new SocketioController();
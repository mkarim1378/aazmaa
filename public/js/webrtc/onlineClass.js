/*
A)
    #0- get stream DONE
    #1- collect Tracks DONE
    #2- create pc with RTCPeerConnection DONE
    #3- add event listener for icecandidate event DONE
    #4- create offer(description) with pc.createOffer with these options const offerOptions = {
                                                                                    offerToReceiveAudio: 1,
                                                                                    offerToReceiveVideo: 1
                                                                                }; DONE
    #5- add tracks with stream.getTracks() to pc with pc.addTracks(track, stream) DONE
    #6- pc1.setLocalDescription(description created from pc1) and pc2.setRemoteDescription(description created from pc1)
    #7- create answer from pc2 with await pc2.createAnswer()
    #8- pc2.setLocalDescription(answer created from level 7) and pc1.setRemoteDescription(answer created from level 7)

B) event listeners
    1- onIceCandidate(pc, event){
        otherPc.addIceCandidate(event.candidate);
    }
*/

let i = 1;
let watching = false;
let isSharing = false;
const config = {
    iceServers: [
        {
            "urls": ["stun:stun.l.google.com:19302"],
        },
        // { 
        //   "urls": "turn:TURN_IP?transport=tcp",
        //   "username": "TURN_USERNAME",
        //   "credential": "TURN_CREDENTIALS"
        // }
    ]
};
let stream = null;
let mode = '';
let video = document.querySelector('#video');
let localPeerConnection = {}; //2
let watchConnection;
let broadcastConnection = new RTCPeerConnection(config);
async function setStream(mode) {
    isSharing = true;
    try {
        if (mode == 'camera') {
            console.log('camera mode');
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            console.log(stream);
        } else if (mode == 'shareScreen') {
            console.log('share mode');
            console.log(stream);
            stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        }
        
        video.srcObject = stream;
        
        window.stream = stream;
    } catch (ex) {
        console.log(ex);
    }


}
document.querySelectorAll('video').forEach(tag => {
    tag.addEventListener('click', event => {
        var elem = document.getElementById("video");
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }
    });
});
document.querySelector('#shareScreen').addEventListener('click', async event => {
    if (window.stream) {
        window.stream.getTracks().forEach(track => {
            track.stop();
        });
    }

    let broadcasting = null;

    try {
        await setStream('shareScreen'); //0    
        console.log(`${i}) broadcasting`);
        i++;
        classSocket.emit('broadcasting', { broadcaster: classSocket.id });
    } catch (ex) {
        console.log(ex);
    }
})
document.querySelector('#camera').addEventListener('click', async event => {
    console.log('camera clicked');
    if (window.stream) {
        window.stream.getTracks().forEach(track => {
            track.stop();
        });
    }

    let cameraSharing = null;

    try {
        await setStream('camera'); //0    
        console.log(`${i}) broadcasting`);
        i++;
        classSocket.emit('broadcasting', { broadcaster: classSocket.id });
    } catch (ex) {
        console.log(ex);
    }

    if (localStorage.getItem('cameraSharing')) cameraSharing = localStorage.getItem('cameraSharing');

    if (!cameraSharing || (cameraSharing == 'false')) {

        localStorage.setItem('cameraSharing', 'true');

    }
    if (cameraSharing == 'true') {
        for (let key in localPeerConnection) {
            localPeerConnection[key].close();
        }
        stream = null;
        video.srcObject = null;
        classSocket.emit('broadcaster-disconnected', { from: classSocket.id });
        localStorage.setItem('cameraSharing', 'false');
    }

});

classSocket.on('watch', async ({ watcher }) => {

    if ((classSocket.id != watcher)) {
        console.log(`${i}) receive watch from another`);
        i++;
    }
    
    if ((classSocket.id != watcher) && stream != null) {

        let newPeerConnection = new RTCPeerConnection(config)
        localPeerConnection[watcher] = newPeerConnection;
        let stream = video.srcObject;

        stream.getTracks().forEach(track => newPeerConnection.addTrack(track, stream)); //0, 5
        newPeerConnection.onicecandidate = event => { //3
            if (event.candidate) {
                console.log(`${i}) sending candidate`);
                i++;
                classSocket.emit('candidate', { who: 'broadcaster', from: classSocket.id, to: watcher, data: event.candidate });
            }
        }
        let sdp = await newPeerConnection.createOffer(); //4

        await newPeerConnection.setLocalDescription(sdp);//6 part A
        console.log(`${i}) sending offer`);
        i++;
        classSocket.emit('offer', { reload: isSharing, broadcaster: classSocket.id, description: newPeerConnection.localDescription });
    }
});
classSocket.on('candidate', async ({ to, from, data, who }) => {

    if (who == 'watcher') {
        console.log(`${i}) receive candidate from watcher`);
        i++;
        try {
            console.log('addIceCandidate for broadcaster');
            localPeerConnection[from].addIceCandidate(new RTCIceCandidate(data));
        } catch (ex) {
            console.log(ex);
        }
    } else {
        console.log(`${i}) receive candidate from broad caster`);
        i++;
        try {

            watchConnection.addIceCandidate(new RTCIceCandidate(data))
        } catch (ex) {
            console.log(ex);
        }
    }
})
classSocket.on('answer', async ({ from, description }) => {

    if (from != classSocket.id) {
        console.log(`${i}) answer from watcher`);
        i++;
        try {

            localPeerConnection[from].setRemoteDescription(description);
        } catch (ex) {
            console.log(ex);
        }
    }
})
classSocket.on('broadcasting', ({ broadcaster }) => {

    if (broadcaster != classSocket.id) {
        console.log(`${i}) receive broad casting`);
        i++;
        console.log(`${i}) sending watch request`);
        i++;
        classSocket.emit('watch', { to: broadcaster, watcher: classSocket.id });
    }
});
classSocket.on('offer', async ({ reload, broadcaster, description }) => {


    if ((classSocket.id != broadcaster) && (reload || !watching)) {
        watching = true;
        console.log(`${i}) receive offer`);
        i++;
        watchConnection = new RTCPeerConnection(config);
        watchConnection
            .setRemoteDescription(description)
            .then(() => watchConnection.createAnswer())
            .then(sdp => watchConnection.setLocalDescription(sdp))
            .then(() => {
                console.log(`${i}) sending answer`);
                i++;
                classSocket.emit('answer', { from: classSocket.id, to: broadcaster, description: watchConnection.localDescription });
            });

        watchConnection.ontrack = event => {
            
            video.srcObject = event.streams[0];
        
            
            
            // video.srcObject = event.streams[0];
        }

        watchConnection.onicecandidate = event => {
            if (event.candidate) {
                console.log(`${i}) sending candidate to broadcaster`);
                i++;
                classSocket.emit("candidate", { who: 'watcher', from: classSocket.id, to: broadcaster, data: event.candidate });
            }
        };
    }
});

classSocket.on("connect", () => {
    console.log(`${i}) sending watch request`);
    i++;
    classSocket.emit("watch", { watcher: classSocket.id });
});


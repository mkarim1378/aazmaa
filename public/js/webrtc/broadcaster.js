(() => {
    
    const peerConnections = {};
    const config = {
        iceServers: [
            {
                "urls": "stun:stun.l.google.com:19302",
            },
            // { 
            //   "urls": "turn:TURN_IP?transport=tcp",
            //   "username": "TURN_USERNAME",
            //   "credential": "TURN_CREDENTIALS"
            // }
        ]
    };



    classSocket.on("answer", (id, description) => {
        peerConnections[id].setRemoteDescription(description);
    });

    classSocket.on("watcher", id => {
        const peerConnection = new RTCPeerConnection(config);
        peerConnections[id] = peerConnection;

        let stream = videoElement.srcObject;
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                classSocket.emit("candidate", id, event.candidate);
            }
        };

        peerConnection
            .createOffer()
            .then(sdp => peerConnection.setLocalDescription(sdp))
            .then(() => {
                classSocket.emit("offer", id, peerConnection.localDescription);
            });
    });

    classSocket.on("candidate", (id, candidate) => {
        peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
    });

    classSocket.on("disconnectPeer", id => {
        peerConnections[id].close();
        delete peerConnections[id];
    });

    window.onunload = window.onbeforeunload = () => {
        classSocket.close();
    };

    // Get camera and microphone
    const videoElement = document.querySelector("video");




    getStream()
        .then(() => { })



    function getStream() {
        if (window.stream) {
            window.stream.getTracks().forEach(track => {
                track.stop();
            });
        }

        return navigator.mediaDevices
            .getUserMedia({ video: true })
            .then(gotStream)
            .catch(handleError);
    }

    function gotStream(stream) {
        window.stream = stream;

        videoElement.srcObject = stream;
        classSocket.emit("broadcaster");
    }

    function handleError(error) {
        console.error("Error: ", error);
    }
})()
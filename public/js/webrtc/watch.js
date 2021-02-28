(() => {
  let peerConnection;
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

  let i = 1;
  const video = document.querySelector("video");

  classSocket.on("offer", (id, description) => {

    peerConnection = new RTCPeerConnection(config);
    peerConnection
      .setRemoteDescription(description)
      .then(() => peerConnection.createAnswer())
      .then(sdp => peerConnection.setLocalDescription(sdp))
      .then(() => {
        classSocket.emit("answer", id, peerConnection.localDescription);
      });
    peerConnection.ontrack = event => {
      video.srcObject = event.streams[0];
    };
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        classSocket.emit("candidate", id, event.candidate);
      }
    };
  });


  classSocket.on("candidate", ({ to, from, data, who }) => {
    try {

      watchConnection.addIceCandidate(new RTCIceCandidate(data))
    } catch (ex) {
      console.log(ex);
    }
  });

  classSocket.on("connect", () => {
    classSocket.emit("watch", { watcher: classSocket.id });
  });

  classSocket.on("broadcasting", ({broadcaster}) => {
    classSocket.emit('watch', { to: broadcaster, watcher: classSocket.id });
  });




})()
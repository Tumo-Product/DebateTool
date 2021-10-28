const left      = document.querySelector("#left");
const right     = document.querySelector("#right");
const output    = document.querySelector("#output");
const videos    = [left];
let recorder    = null;
let mixer       = null;

const init = async () => {
    const videoStream   = await getVideoStream(left);
    const cameraStream  = await getCameraStream();
    attachCameraStreamToVideo(cameraStream, right);
    const streams = [videoStream, cameraStream];
    mixer = new StreamMixer(streams);
    mixer.startMixing();
    recorder = new Recorder(mixer.getMixedStream());

    // Setup click events.
    document.querySelector("#mix-button").onclick = () => {
        output.srcObject = mixer.getMixedStream();
        output.play();
    };
    document.querySelector("#start-button").onclick = async () => {
        videos.forEach((v) => v.play());
        recorder.start();
    };
    document.querySelector("#stop-button").onclick = () => {
        recorder.stop().then(() => {
            var blob = recorder.getBlob();
            output.srcObject = null;
            output.src = URL.createObjectURL(blob);
            output.muted = false;
            output.play();
        });
    };
    document.querySelector("#download-button").onclick = () => {
        const blob = recorder.getBlob();
        const url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "record.webm";
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };
};

// $(init);

const getAudioContext = () => {
    if (typeof AudioContext !== "undefined") {
        return new AudioContext();
    }
    else if (typeof window.webkitAudioContext !== "undefined") {
        return new window.webkitAudioContext();
    }
    else if (typeof window.mozAudioContext !== "undefined") {
        return new window.mozAudioContext();
    }
}

const getVideoStream = (video) => {
    return new Promise((resolve) => {
        video.onloadedmetadata = (e) => {
            resolve(e.target.captureStream());
            console.log("video", video.videoWidth, video.videoHeight);
        };
    });
}

const getCameraStream = () => {
    return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
}

const attachCameraStreamToVideo = (stream, video) => {
    video.srcObject = stream;
    video.play();
}

const getVideoTrack = (stream) => {
    const tracks = stream.getTracks().filter(t => t.kind === "video");
    if (tracks.length === 0)
        return null;
    return tracks[0];
}

const createVideo = (stream) => {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    video.play();
    return video;
}

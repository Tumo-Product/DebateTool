"use strict";
console.clear();
const left = document.querySelector("#left");
const right = document.querySelector("#right");
const output = document.querySelector("#output");
const videos = [left];
let recorder = null;
let mixer = null;

class Recorder {
    constructor(stream) {
        this.stream = stream;
        this.chunks = [];
        this.recorder = null;
        this.recorder = new MediaRecorder(stream);
        this.recorder.ondataavailable = (e) => {
            this.chunks.push(e.data);
        };
    }
    getBlob() {
        return new Blob(this.chunks, { type: "video/webm" });
    }
    start() {
        this.chunks = [];
        this.recorder.start();
    }
    stop() {
        this.recorder.stop();
        return new Promise((resolve) => {
            this.recorder.onstop = resolve;
        });
    }
}
class StreamMixer {
    constructor(streams) {
        this.streams = streams;
        this.canvas = document.createElement("canvas");
        this.canvasContext = this.canvas.getContext("2d");
        this.sizes = [];
        this.gainNode = null;
        this.audioSources = [];
        this.audioDestination = null;
        this.loadedStreamCount = 0;
        this.itemSize = { width: 0, height: 0 };
        this.tempVideos = [];
        this.frameInterval = 10;
        this.canvas.style = "opacity:0;position:absolute;z-index:-1;top: -100000000;left:-1000000000; margin-top:-1000000000;margin-left:-1000000000;";
        this.streams.forEach((s, i) => {
            const track = getVideoTrack(s);
            if (!track) {
                throw "Unexpected non-video track";
            }
            const settings = track.getSettings();
            this.sizes[i] = { width: settings.width, height: settings.height };
            console.log("stream size", this.sizes[i]);
        });
        document.body.appendChild(this.canvas);
    }
    startMixing() {
        this.itemSize = this.sizes.reduce((memo, sz) => ({
            width: Math.max(memo.width, sz.width),
            height: Math.max(memo.height, sz.height)
        }), { width: 0, height: 0 });
        this.canvas.width = this.itemSize.width * this.streams.length;
        this.canvas.height = this.itemSize.height;
        this.generateVideos();
        this.drawVideosToCanvas();
    }
    drawVideosToCanvas() {
        this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.videos.forEach((stream, index) => {
            this.drawImage(stream, index);
        });
        setTimeout(this.drawVideosToCanvas.bind(this), this.frameInterval);
    }
    drawImage(video, index) {
        if (this.isStopDrawingFrames) {
            return;
        }
        const width = this.sizes[index].width;
        const height = this.sizes[index].height;
        const factor = Math.min(this.itemSize.width / width, this.itemSize.height / height);
        const adjustedWidth = width * factor;
        const adjustedHeight = height * factor;
        const diffWidth = this.itemSize.width - adjustedWidth;
        const diffHeight = this.itemSize.height - adjustedHeight;
        const x = index * this.itemSize.width + diffWidth / 2;
        const y = 0 + diffHeight / 2;
        this.canvasContext.drawImage(video, x, y, adjustedWidth, adjustedHeight);
    }
    getMixedStream() {
        this.isStopDrawingFrames = false;
        const audioStream = this.getMixedAudioStream();
        // return audioStream;
        const videoStream = this.getMixedVideoStream();
        if (audioStream !== null) {
            audioStream.getTracks().forEach((audioTrack) => {
                videoStream.addTrack(audioTrack);
            });
        }
        return videoStream;
    }
    getMixedVideoStream() {
        return this.canvas.captureStream();
    }
    getMixedAudioStream() {
        if (!this.audioContext)
            this.audioContext = getAudioContext();
        this.audioSources = [];
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        this.gainNode.gain.value = 0; // don't hear self
        this.streams.forEach((stream) => {
            const audioTracks = stream.getTracks().filter((x) => x.kind === "audio");
            if (!audioTracks.length)
                return;
            let audioSource = this.audioContext.createMediaStreamSource(stream);
            audioSource.connect(this.gainNode);
            this.audioSources.push(audioSource);
        });
        if (!this.audioSources.length)
            return null;
        this.audioDestination = this.audioContext.createMediaStreamDestination();
        console.log("audioSources", this.audioSources.length);
        this.audioSources.forEach((source) => {
            source.connect(this.audioDestination);
        });
        return this.audioDestination.stream;
    }
    generateVideos() {
        this.videos = [];
        this.streams.map((s, i) => {
            const track = getVideoTrack(s);
            if (!track) {
                throw "Unexpected";
            }
            this.videos[i] = createVideo(s);
        });
    }
}

const init = async () => {
    const videoStream = await getVideoStream(left);
    const cameraStream = await getCameraStream();
    attachCameraStreamToVideo(cameraStream, right);
    const streams = [videoStream, cameraStream];
    mixer = new StreamMixer(streams);
    mixer.startMixing();
    recorder = new Recorder(mixer.getMixedStream());
    console.log(recorder);
};

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

function getAudioContext() {
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

function getVideoStream(video) {
    return new Promise((resolve) => {
        video.onloadedmetadata = (e) => {
            resolve(e.target.captureStream());
            console.log("video", video.videoWidth, video.videoHeight);
        };
    });
}
function getCameraStream() {
    return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
}
function attachCameraStreamToVideo(stream, video) {
    video.srcObject = stream;
    video.play();
}
function getVideoTrack(stream) {
    const tracks = stream.getTracks().filter(t => t.kind === "video");
    if (tracks.length === 0)
        return null;
    return tracks[0];
}
function createVideo(stream) {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    video.play();
    return video;
}

// $(init);
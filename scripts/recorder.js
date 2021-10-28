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
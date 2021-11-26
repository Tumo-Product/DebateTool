const videoManager = {
    getCameraStream: async() => {
        return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    },

    attachStream: async (stream, video) => {
        document.getElementById(video + "Video").srcObject = stream;
        document.getElementById(video + "Video").play();
    },

    setVideoSource: async (source, video) => {
        document.getElementById(video + "Video").src = source;
        document.getElementById(video + "Video").srcObject = null;
        document.getElementById(video + "Video").pause();
    },

    play: async (video) => {
        document.getElementById(video + "Video").play();
    },
    
    pause: async (video) => {
        document.getElementById(video + "Video").pause();
    }
}
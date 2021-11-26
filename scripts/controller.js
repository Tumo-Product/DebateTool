const controller = {
    recording:  false,
    reviewing:  false,
    playing:    false,
    paused:     false,

    setup: async () => {
        $("#centerBtn").click(controller.recordClickHandler);
        $("#leftBtn").click(controller.pauseClickHandler);
        $("video").each(function() {
            $(this)[0].addEventListener("ended", function() {
                view.replaceButton("centerBtn", "play");
                controller.playing = false;
            })
        })
    },

    recordClickHandler: async () => {
        controller.recording = !controller.recording;

        if (controller.recording) {
            controller.record();
            document.getElementById("voicover").pause();
        } else {
            controller.stopRecording();
        }
    },

    pauseClickHandler: async() => {
        controller.paused = !controller.paused;

        if (controller.paused) {
            controller.pause();
        } else {
            controller.resume();
        }
    },

    setupReview: async () => {
        $("#controller .button").unbind("click");
        $(`#${currentGuest}Video`).prop("muted", false);

        $("#leftBtn").click(function () {
            controller.cancel();
            videoManager.attachStream(camStream, currentGuest);
        });

        $("#centerBtn").click(controller.togglePlay);
        $("#rightBtn").click(controller.complete);
    },

    cancel: async () => {
        $("#controller .button").unbind("click");
        $(`#${currentGuest}Video`).prop("muted", true);
        $("#centerBtn").click(controller.recordClickHandler);
        $("#leftBtn").click(controller.pauseClickHandler);

        controllerView.cancel();
        controller.playing = false;
        currBaseVideo = null;
    },

    togglePlay: async() => {
        controller.playing = !controller.playing;
        
        if (controller.playing) {
            videoManager.play(currentGuest);
            view.replaceButton("centerBtn", "pause");
        } else {
            videoManager.pause(currentGuest);
            view.replaceButton("centerBtn", "play");
        }
    },

    complete: async () => {
        let oldGuest = currentGuest;
        controller.cancel();
        handleAnswer();

        await timeout(500);
        videoManager.attachStream(camStream, oldGuest);
    },

    record : async () => {
        recorder.start();
        controllerView.record();
    },
    pause : async () => {
        recorder.pause();
        controllerView.pause();
    },
    resume: async () => {
        recorder.resume();
        controllerView.resume();
    },
    stopRecording: async () => {
        recorder.stop().then(() => {
            controllerView.stopRecording();
            handleRecording();
            controller.setupReview();
        });
    }
}

const controllerView = {
    record: async () => {
        $("#centerBtn").addClass("recording");
        $("#leftBtn").removeClass("deactivated");
    },
    stopRecording: async () => {
        $("#centerBtn").removeClass("recording");
        view.replaceButton("leftBtn", "cancel");
        view.replaceButton("centerBtn", "play");
        $("#rightBtn").removeClass("invisible");
    },
    pause: async () => {
        view.replaceButton("leftBtn", "record");
    },
    resume: async () => {
        view.replaceButton("leftBtn", "pause");
    },
    cancel: async () => {
        $("#rightBtn").addClass("invisible");
        view.replaceButton("centerBtn", "record");
        view.replaceButton("leftBtn", "pause");
        $("#leftBtn").addClass("deactivated");
    },
    moveRecorder: async (where) => {
        $("#recorder").removeClass("recorderLeft recorderRight");
        $("#recorder").addClass(where === "left" ? "recorderLeft" : "recorderRight");

        $(".profilePic").each(function() {
            if ($(this).hasClass("invisible")) {
                $(this).removeClass("invisible");
            }
        });
        await timeout(150);
        $(`#${where}Frame .profilePic`).addClass("invisible");
    }
}
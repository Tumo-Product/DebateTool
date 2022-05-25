let reviewData;
let currQuestion = 0;
let reviewGuest = "left";
let elemPaused;

const startPlayback = async (outcome) => {
    reviewData = outcome;
    setupEvents();
    $(`video`).prop("muted", false);
    if (window.location.href.includes("examiner")) {
        videoManager.setVideoSource(reviewData.leftResponses[0],   "left");
        videoManager.setVideoSource(reviewData.rightResponses[0],  "right");
    }

    $("#leftName p").text(reviewData.leftName);
    $("#rightName p").text(reviewData.rightName);
    $("#loadingScreen").hide();    
}

const togglePlay = () => {
    if (elemPaused === undefined) {
        if (!voiceover.paused) {
            elemPaused = voiceover;
            voiceover.pause();
        } else if (!leftVideo.paused) {
            elemPaused = leftVideo;
            leftVideo.pause();
        } else if (!rightVideo.paused) {
            elemPaused = rightVideo;
            rightVideo.pause();
        } else {
            audioManager.playVoiceover(reviewData.voiceovers[currQuestion]);
        }
    } else {
        elemPaused.play();
        elemPaused = undefined;
    }        
    
    view.toggleBigPlay();
}

const setupEvents = async () => {
    let voiceover   = document.getElementById("voiceover");
    let leftVideo   = document.getElementById("leftVideo");
    let rightVideo  = document.getElementById("rightVideo");
    
    voiceover.addEventListener("ended", function() {
        videoManager.play(reviewGuest);
    });

    leftVideo.addEventListener("ended", function() {
        reviewGuest = "right";
        view.switchFrameTo(reviewGuest);
        videoManager.play(reviewGuest);
    });

    rightVideo.addEventListener("ended", async function() {
        reviewGuest = "left";
        currQuestion++;
        if (reviewData.leftResponses[currQuestion] === undefined) {
            currQuestion = 0;

            view.switchFrameTo(reviewGuest);
            videoManager.setVideoSource(reviewData.leftResponses[currQuestion], "left");
            await timeout(500);
            videoManager.setVideoSource(reviewData.rightResponses[currQuestion], "right");

            view.toggleBigPlay();
            return;
        }

        videoManager.setVideoSource(reviewData.leftResponses[currQuestion], "left");
        view.switchFrameTo(reviewGuest);
        audioManager.playVoiceover(reviewData.voiceovers[currQuestion]);
        await timeout(500);
        videoManager.setVideoSource(reviewData.rightResponses[currQuestion], "right");
    });

    $("#bigPlay").click(togglePlay);
}
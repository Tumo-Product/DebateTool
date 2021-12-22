let outcome = { voiceovers: undefined, leftName: "", rightName: "", leftResponses: [], rightResponses: [] }
let voiceovers = [];
let data;

let questionsLength = 0;
let currBaseVideo;
let currentGuest = "left";
let answerCount = 0;
let camStream;
let recorder;

const onLoad = async () => {
    data = await network.getData();
    questionsLength = data.questions.length * 2;
    view.initText(data.sides, data.repIntro, data.intro);
    handleStartBtn();
    
    camStream   = await videoManager.getCameraStream();
    recorder    = new Recorder(camStream);
    videoManager.attachStream(camStream, "left");
    videoManager.attachStream(camStream, "right");
    controller.setup();

    view.setQuestionText(data.questions[0].text);
    await audioManager.getVoiceovers(data.questions, voiceovers);

    loader.toggle();
}

const onStart = async () => {
    getInputData();
    $("#start").unbind("click");
    await view.onStart(outcome.leftName, outcome.rightName);
    await timeout(100);
    audioManager.playVoiceover(voiceovers[0]);
}

const handleStartBtn = async () => {
    $("#start").click(onStart);
    
    $("input").on("input", function() {
        let leftVal = $("#leftInput").val().trim();
        let rightVal = $("#rightInput").val().trim();

        if (leftVal.length > 0 && rightVal.length > 0) {
            $("#start").removeClass("deactivated");
        } else {
            $("#start").addClass("deactivated");
        }
    });
}

const getInputData = async () => {
    outcome.leftName    = $("#leftInput").val().trim();
    outcome.rightName   = $("#rightInput").val().trim();
}

const handleRecording = async () => {
    currBaseVideo = await recorder.getBaseVideo();
    videoManager.setVideoSource(currBaseVideo, currentGuest);
}

const handleAnswer = async () => {
    outcome[currentGuest + "Responses"].push(currBaseVideo);
    answerCount++;

    currentGuest = currentGuest === "left" ? "right" : "left";

    if (answerCount === questionsLength) {
        videoManager.setVideoSource(outcome.leftResponses[0],   "left");
        view.switchFrameTo(currentGuest); await timeout(1000);
        videoManager.setVideoSource(outcome.rightResponses[0],  "right");

        outcome.voiceovers = voiceovers;
        await view.setupEndView();
        startPlayback(outcome);
        setAnswers(outcome);
        return false;
    }

    controllerView.moveRecorder(currentGuest);
    view.switchFrameTo(currentGuest);
    if (answerCount % 2 === 0) {
        view.setQuestionText(data.questions[answerCount / 2].text);
        audioManager.playVoiceover(voiceovers[answerCount / 2]);
    }

    return true;
}

$(onLoad);
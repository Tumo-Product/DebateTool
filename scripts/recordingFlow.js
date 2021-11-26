const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let outcome = { leftName: "", rightName: "", leftResponses: [], rightResponses: [] }
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
    view.initText(data.repText, data.sides, data.repIntro, data.intro);
    handleStartBtn();
    
    camStream   = await videoManager.getCameraStream();
    recorder    = new Recorder(camStream);
    videoManager.attachStream(camStream, "left");
    videoManager.attachStream(camStream, "right");
    controller.setup();

    view.setQuestionText(data.questions[0].text);
    await getVoicovers(data.questions);

    loader.toggle();
}

const getVoicovers = async (questions) => {
    axios.defaults.baseURL = "https://content-tools.tumo.world:4000";

    for (let i = 0; i < questions.length; i++) {
        let path = questions[i].audio;
        let voiceover = await network.getFile(path);
        voiceover = "data:audio/mpeg;base64," + voiceover;
        voiceovers.push(voiceover);
    }
}

const playVoicover = async (i) => {
    document.getElementById("voicover").src = voiceovers[i];
    document.getElementById("voicover").currentTime = 0;
    document.getElementById("voicover").play();
}

const onStart = async () => {
    getInputData(data.sides);
    $("#start").unbind("click");
    await view.onStart(outcome.leftName, outcome.rightName);
    await timeout(100);
    playVoicover(0);
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

const getInputData = async (sides) => {
    outcome.leftName    = `${sides[0]}: ${$("#leftInput").val().trim()}`;
    outcome.rightName   = `${sides[1]}: ${$("#rightInput").val().trim()}`;
}

const handleRecording = async () => {
    currBaseVideo = await recorder.getBaseVideo();
    videoManager.setVideoSource(currBaseVideo, currentGuest);
}

const handleAnswer = async () => {
    outcome[currentGuest + "Responses"].push(currBaseVideo);
    answerCount++;

    if (currentGuest === "left") {
        currentGuest = "right";
        controllerView.moveRecorder(currentGuest);
    } else {
        currentGuest = "left";
        controllerView.moveRecorder(currentGuest);
    }

    if (answerCount === questionsLength) {
        view.setupEndView();
        return;
    }

    if (answerCount % 2 === 0) {
        view.setQuestionText(data.questions[answerCount / 2].text);
        playVoicover(answerCount / 2);
    }
}

$(onLoad);
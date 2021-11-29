const audioManager = {
    getVoiceovers: async (questions, voiceovers) => {
        for (let i = 0; i < questions.length; i++) {
            let path = questions[i].audio;
            let voiceover = await network.getFile(path);
            voiceover = "data:audio/mpeg;base64," + voiceover;
            voiceovers.push(voiceover);
        }
    },
    
    playVoiceover: async (voiceover) => {
        document.getElementById("voiceover").src = voiceover;
        document.getElementById("voiceover").currentTime = 0;
        document.getElementById("voiceover").play();
    }
}
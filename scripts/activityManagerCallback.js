const initialize = () => {
    window.parent.postMessage({
        application: "activity-manager",
        message: "init"
    }, '*');
    
    window.addEventListener("message", event => {
        if (event.data.application !== "activity-manager") {
            return;
        }
    
        console.log(event.data.message);
        console.log(event.data);
    
        switch(event.data.message) {
            case 'init-response':
                if (window.location.href.includes("examiner")) {
                    const { data } = event.data;
                    let outcome = data.answers[0];
                    startPlayback(outcome);
                }
            break;
        }
    });
    
    window.parent.postMessage({
        application: 'activity-manager',
        message: 'set-iframe-height',
        data: { iframeHeight: 650 }
    }, '*');
}

const setAnswers = (outcome) => {
    window.parent.postMessage({
        application: 'activity-manager',
        message: 'set-answers',
        data: { answers: [outcome] }
    }, '*');
}

initialize();
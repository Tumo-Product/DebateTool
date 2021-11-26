const view = {
    onStart: async (leftName, rightName) => {
        $("#start").addClass("under");
        $(".introduction").css("opacity", 0);
        $("#inputsCard").addClass("goLeft");

        await timeout(1000);

        $(".over").removeClass("over");
        $("#controller").removeClass("closed");
        $("#question").removeClass("under");

        $("#leftName p").text(leftName);
        $("#rightName p").text(rightName);
    },
    initText: async (repText, sides, repIntro, intro) => {
        $("#leftInputRep").text (repText + sides[0]);
        $("#rightInputRep").text(repText + sides[1]);

        $("#repIntro").html(repIntro);
        $("#intro").html(intro);
    },
    setQuestionText: async (text) => {
        $("#question p").animate({"margin-bottom": "26px", opacity: 0}, 350);
        await timeout(350);
        $("#question p").html(text);
        await timeout(60);
        $("#question p").css({"margin-bottom": 0, "margin-top": "26px", opacity: 0});
        $("#question p").animate({"margin-top": 0, "margin-bottom": "0px", opacity: 1}, 350);
    },
    replaceButton: async (which, button) => {
        $(`#${which} .current`).removeClass("current");
        await timeout(50);
        $(`#${which} #${button}`).addClass("current");
    },

    setupEndView: async () => {
        $("#question").addClass("under");
        $("#controller").addClass("closed");
        await timeout(500);
        $("#leftFrame").addClass("largeLeftFrame");
        $("#rightFrame").addClass("largeRightFrame");
        $("#leftName").addClass("largeLeftName");
        $("#rightName").addClass("largeRightName");
    }
}
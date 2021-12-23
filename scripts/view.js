const view = {
    playing: false,

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
    initText: async (sides, repIntro, intro) => {
        $("#leftInputRep").html (sides[0]);
        $("#rightInputRep").html(sides[1]);

        $("#repIntro").html(repIntro);
        $("#intro").html(intro);
    },
    setQuestionText: async (text) => {
        $("#question p").animate({"margin-bottom": "26px", opacity: 0}, 350);
        await timeout(350);
        $("#question p").html(text);
        view.fitText($("#question p"), 91, 18, 24);
        await timeout(60);
        $("#question p").css({"margin-bottom": 0, "margin-top": "26px", opacity: 0});
        $("#question p").animate({"margin-top": 0, "margin-bottom": "0px", opacity: 1}, 350);
    },
    replaceButton: async (which, button) => {
        $(`#${which} .current`).removeClass("current");
        await timeout(50);
        $(`#${which} #${button}`).addClass("current");
    },

    switchFrameTo: async (where) => {
        $(".profilePic").each(function() {
            if ($(this).hasClass("invisible")) {
                $(this).removeClass("invisible");
            }
        });
        await timeout(150);
        $(`#${where}Frame .profilePic`).addClass("invisible");
    },

    setupEndView: async () => {
        $("#question").addClass("under");
        $("#controller").addClass("closed");
        await timeout(1100);
        $("#leftFrame").addClass("largeLeftFrame");
        $("#rightFrame").addClass("largeRightFrame");
        $("#leftName").addClass("largeLeftName");
        $("#rightName").addClass("largeRightName");

        $("#rightFrame video").css("opacity", 0); 
        setTimeout(() => {
            $("#rightFrame video").css("opacity", 1);
        }, 500);
        await timeout(200);

        $("#bigPlay").removeClass("under"); await timeout(500);
    },

    fitText: async (element, height, defaultFontSize, defaultLineHeight) => {
        if (element.height() > height) {
            element.css({"font-size": "-=0.5px", "line-height": "-=0.5px"});
            view.fitText(element, height);
        } else {
            element.css({"font-size": defaultFontSize, "line-height": `${defaultLineHeight}px`});
        }
    },

    toggleBigPlay: async () => {
        view.playing = !view.playing;

        if (view.playing) {
            view.replaceButton("bigPlay", "bigPauseIcon");
        } else {
            view.replaceButton("bigPlay", "bigPlayIcon");
        }
    }
}
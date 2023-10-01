let rainbowSnake = false;
let autoSnake = false;
let powerups = false;
let minimumScore = 400;

var rainbowColors = ['#ff004d', '#ffa500', '#fee11a', '#74b741', '#0000ff', '#2b22aa', '#ff00ff'];


function myRainbowFunction() {
    // Get the checkbox
    var checkBox = document.getElementById("myRainbowCheck");

    // If the checkbox is checked, display the output text
    if (checkBox.checked == true) {
        rainbowSnake = true;
    } else {
        rainbowSnake = false;
    }
}

function myAutoSnakeFunction() {
    // Get the checkbox
    var checkBox = document.getElementById("myAutoSnakeCheck");

    // If the checkbox is checked, display the output text
    if (checkBox.checked == true) {
        autoSnake = true;
    } else {
        autoSnake = false;
    }
}

function myPowerupFunction() {
    // Get the checkbox
    var checkBox = document.getElementById("myPowerupCheck");

    // If the checkbox is checked, display the output text
    if (checkBox.checked == true) {
        powerups = true;
        var powerupsLayer = document.getElementsByName('powerupsLayer');
        for (var i = 0; i < powerupsLayer.length; i++) {
            powerupsLayer[i].style.display = "inline";
        }

        var noPowerupsLayer = document.getElementsByName('noPowerupsLayer');
        for (var i = 0; i < noPowerupsLayer.length; i++) {
            noPowerupsLayer[i].style.display = "none";
        }
    } else {
        powerups = false;
        var powerupsLayer = document.getElementsByName('powerupsLayer');
        for (var i = 0; i < powerupsLayer.length; i++) {
            powerupsLayer[i].style.display = "none";
        }

        var noPowerupsLayer = document.getElementsByName('noPowerupsLayer');
        for (var i = 0; i < noPowerupsLayer.length; i++) {
            noPowerupsLayer[i].style.display = "inline";
        }
    }
}
let soloFct = function (p) {
    let canvaSize = 625;
    let snake;

    var intervalID = window.setInterval(myCallback, 100);

    p.setup = function () {
        p.createCanvas(canvaSize, canvaSize);
        snake = new SnakeGame(4, 4, p);
        snake.generateFood();
    }

    p.keyPressed = function () {
        if (p.keyCode === p.RIGHT_ARROW || p.keyCode === 68) {
            if (snake.direction == direction.LEFT) {
                snake.direction = direction.UP;
            } else {
                snake.direction++;
            }
        } else if (p.keyCode === p.LEFT_ARROW || p.keyCode === 65) {
            if (snake.direction == direction.UP) {
                snake.direction = direction.LEFT;
            } else {
                snake.direction--;
            }
        } else if (p.keyCode === 82) {
            if (canvaSize == 625) {
                canvaSize = 125;
                p.createCanvas(canvaSize, canvaSize);
                snake.resize5TimesSmaller();
            } else {
                canvaSize = 625;
                p.createCanvas(canvaSize, canvaSize);
                snake.resizeToDefault();
            }
        }
    }

    function myCallback() {

        p.background(55);
        if (snake.gameOver) {
            snake.drawStatic();
            window.clearInterval(intervalID);
        } else {
            snake.drawDynamic();
            if (autoSnake) {
                snake.autoPlay();
            }
        }
    }
}
function manualPlay() {
    for (var i = 0; i < sketches.length; i++) {
        window.clearInterval(sketches[i].brain.intervalID);
        sketches[i].remove();
    }
    if (trainingStarted) {
        trainingStarted = false;
        document.getElementById('TrainingButton').innerText = 'Start Training';
    }
    population = undefined;
    sketches = [];

    var x = new p5(soloFct, 'firstSpan1');
    x.brain = new Snake(6);
    sketches.push(x);
}
const direction = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
}

const objectsInGrid = {
    EMPTY: 0,
    HEAD: 1,
    BODY: 2,
    FOOD: 3,
    POWERUP_SHORT: 4,
    POWERUP_5X: 5,
    POWERUP_DEVIL: 6
}

/* get random int from range [0, max) */
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

/* downloads file from browser to pc */
function download(strData, strFileName, strMimeType) {
    var D = document,
        A = arguments,
        a = D.createElement("a"),
        d = A[0],
        n = A[1],
        t = A[2] || "text/plain";

    //build download link:
    a.href = "data:" + strMimeType + "charset=utf-8," + escape(strData);


    if (window.MSBlobBuilder) { // IE10
        var bb = new MSBlobBuilder();
        bb.append(strData);
        return navigator.msSaveBlob(bb, strFileName);
    } /* end if(window.MSBlobBuilder) */


    if ('download' in a) { //FF20, CH19
        a.setAttribute("download", n);
        a.innerHTML = "downloading...";
        D.body.appendChild(a);
        setTimeout(function () {
            var e = D.createEvent("MouseEvents");
            e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
            D.body.removeChild(a);
        }, 66);
        return true;
    }; /* end if('download' in a) */



    //do iframe dataURL download: (older W3)
    var f = D.createElement("iframe");
    D.body.appendChild(f);
    f.src = "data:" + (A[2] ? A[2] : "application/octet-stream") + (window.btoa ? ";base64" : "") + "," + (window.btoa ? window.btoa : escape)(strData);
    setTimeout(function () {
        D.body.removeChild(f);
    }, 333);
    return true;
}

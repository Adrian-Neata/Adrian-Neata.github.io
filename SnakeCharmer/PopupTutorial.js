// script.js
const tutorialButton = document.getElementById('tutorialButton');
const tutorialPopup = document.getElementById('tutorialPopup');
const overlay = document.getElementById('overlay');
const popupCloseButton = document.getElementById('popupCloseButton');
const popupNextButton = document.getElementById('nextTutorialButton');
const popupFinishButton = document.getElementById('finishTutorialButton');
const popupPreviousButton = document.getElementById('previousTutorialButton');
const popupContent = document.getElementById('popup-content');
popupPreviousButton.hidden = true;
popupFinishButton.hidden = true;

var currentTutorialPopup = 0;
var tutorialPopupList = [
    ['New to the site and need a <b>tutorial</b>?', { 'width': '250px' }],
    ['This is the final project created with two other students for <b>SUMMER SCHOOL 3DUPB 2020</b>.<br style="padding-top:10px;"></br>We implemented a genetic algorithm for the game Snake using <b>JavaScript</b>. <br style="padding-top:10px;"></br>We also created a simple website with <b>HTML</b> and <b>CSS</b> to show the results.', { 'width': '350px' }],
    ['This shows the <b>highest</b> score obtained by any snake during training.', { 'width': '250px' }, 'tutorialHighlight1'],
    ['This shows the <b>average</b> score obtained by the snakes during training.', { 'width': '250px' }, 'tutorialHighlight2'],
    ['In case you want the snakes to be larger you can press the key <b>r</b>.', { 'width': '250px' }, 'tutorialHighlight3'],
    ['<b>Rainbow Snake</b> makes it so that the body of the snake alternates the colors of the rainbow.<br style="padding-top:10px;"></br>It <b>doesn\'t affect</b> the training process, it\'s just a cosmetic.', { 'width': '250px' }, 'tutorialHighlight4'],
    ['By pressing the play button you can simply play Snake.<br style="padding-top:10px;"></br>Use the keys: <ul><li><b>A</b> and <b>D</b>;</li><li><b>Left Arrow</b> and <b>Right Arrow</b>;</li>', { 'width': '250px' }, 'tutorialHighlight12'],
    ['By checking this box you can let a hardcoded snake to <b>play</b> in your place.', { 'width': '250px' }, 'tutorialHighlight5'],
    ['This slider lets you choose the <b>starting size</b> of the snake.', { 'width': '250px' }, 'tutorialHighlight7'],
    ['This slider lets you choose the <b>population</b> of individual snakes to be run in parallel during <b>each epoch</b>.', { 'width': '250px' }, 'tutorialHighlight8'],
    ['This button starts and stops the <b>training</b>. The training will run indefinitely until stopped.', { 'width': '250px' }, 'tutorialHighlight10'],
    ['We have a few pretrained snakes that can be selected. Once you hit the load button you will see them in action.<br style="padding-top:10px;"></br>There are two types of snakes:<ul><li>Snakes with <b>neural networks</b> as genes (<b>Note: </b> we did not train them on power-ups so they are not available to load when power-ups are on).</li><li>Snakes with arraylists of 0s and 1s as genes.</li></ul>', { 'width': '350px' }, 'tutorialHighlight11'],
    ['We implemented 3 power-ups for the snake: <ul><li><b>Red Apple</b> gives 4 points instead of 1 and only increases the body of the snake by 1.</li><li><b>Golden Star</b> decreases the size of the snake by 1 without affecting the score.</li><li><b>Devil Fruit</b> decreases the score by 3.</li></ul>', { 'width': '350px' }, 'tutorialHighlight6'],
    ['When the power-ups are on a new slider appears that lets you choose the <b>frequency of power-ups</b> during a game.', { 'width': '250px' }, 'tutorialHighlight9'],

]

function loadTutorialPopup(previousTutorialPopup, change) {
    var currentTutorialPopup = previousTutorialPopup + change;
    if (currentTutorialPopup == 0) {
        popupPreviousButton.hidden = true;
    } else {
        popupPreviousButton.hidden = false;
    }

    if (currentTutorialPopup == tutorialPopupList.length - 1) {
        popupNextButton.hidden = true;
        popupFinishButton.hidden = false;
    } else {
        popupNextButton.hidden = false;
        popupFinishButton.hidden = true;
    }

    // update tutorial box text
    popupContent.innerHTML = tutorialPopupList[currentTutorialPopup][0];

    // change shape and position of tutorial box
    styleDictionary = tutorialPopupList[currentTutorialPopup][1];
    for (const property in styleDictionary) {
        tutorialPopup.style[property] = styleDictionary[property];
    }
    if (tutorialPopupList[currentTutorialPopup].length == 3) {
        document.getElementById(tutorialPopupList[currentTutorialPopup][2]).style.borderStyle = "solid";
    }
    if (tutorialPopupList[previousTutorialPopup].length == 3) {
        document.getElementById(tutorialPopupList[previousTutorialPopup][2]).style.borderStyle = "none";
    }
    if (tutorialPopupList[currentTutorialPopup][2] == 'tutorialHighlight9') {
        document.getElementById("myPowerupCheck").click();
    }
}

tutorialButton.addEventListener('click', () => {
    tutorialPopup.style.display = 'block';
    overlay.style.display = 'block';
    loadTutorialPopup(currentTutorialPopup, 0);
});

popupCloseButton.addEventListener('click', () => {
    tutorialPopup.style.display = 'none';
    overlay.style.display = 'none';
    for (idx in tutorialPopupList) {
        if (tutorialPopupList[idx].length == 3) {
            document.getElementById(tutorialPopupList[idx][2]).style.borderStyle = "none";
        }
    }
    currentTutorialPopup = 0;
});

popupFinishButton.addEventListener('click', () => {
    tutorialPopup.style.display = 'none';
    overlay.style.display = 'none';
    for (idx in tutorialPopupList) {
        if (tutorialPopupList[idx].length == 3) {
            document.getElementById(tutorialPopupList[idx][2]).style.borderStyle = "none";
        }
    }
    currentTutorialPopup = 0;
});

popupNextButton.addEventListener('click', () => {
    loadTutorialPopup(currentTutorialPopup, 1);
    currentTutorialPopup += 1;
});

popupPreviousButton.addEventListener('click', () => {
    loadTutorialPopup(currentTutorialPopup, -1);
    currentTutorialPopup -= 1;
});

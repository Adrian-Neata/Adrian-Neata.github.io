let sketches = [];
let highScore = 0;
let population;
var interval;
let trainingStarted = false;

/*creates games */
function initializeGames(numPop, nrInputs) {
    population = new Population(numPop, nrInputs);

    population.set(0.1, [population.settingsOptionsSelection.bestDiversity,
    population.settingsOptionsBreeding.randomMating,
    population.settingsOptionsBestSeed.keepBestSeedOff]);

    highScore = 0

    for (let i = 0; i < sketches.length; i++) {
        window.clearInterval(sketches[i].intervalID);
        sketches[i].remove();
    }

    sketches = [];
    for (let i = 0; i < population.maxPop; i++) {
        sketches.push(new p5(fct, 'firstSpan1'));
        sketches[i].brain = population.population[i];
        sketches[i].brain.id = i;
    }

}

/* activates AI training when button pressed */
function startTraining() {

    if (trainingStarted == false) {
        trainingStarted = true;
        document.getElementById('TrainingButton').innerText = 'Stop Training';
    } else {
        for (var i = 0; i < sketches.length; i++) {
            window.clearInterval(sketches[i].brain.intervalID);
            sketches[i].remove();
        }
        population = undefined;
        sketches = [];
        trainingStarted = false;
        document.getElementById('TrainingButton').innerText = 'Start Training';
        clearInterval(interval);
        return;
    }

    /* creates games */
    var sliderPopulationSize = document.getElementById('populationSize');
    if (powerups) {
        initializeGames(sliderPopulationSize.value, 11);
    } else {
        initializeGames(sliderPopulationSize.value, 6);
    }
    /* makes sure only 1 test per second */
    clearInterval(interval);

    /* tests every second if the whole population died and creates a new one */
    interval = setInterval(function () {
        let deaths = 0;
        for (let i = 0; i < population.maxPop; i++) {
            if (sketches[i].brain.alive == false) {
                population.population[i].score = sketches[i].brain.score;
                deaths++;
            }
        }
        if (deaths == population.maxPop) {
            let maxScore = 0;
            let averageScore = 0;

            for (let i = 0; i < population.maxPop; i++) {
                averageScore += sketches[i].brain.snakeScore;
                if (maxScore < sketches[i].brain.snakeScore) {
                    maxScore = sketches[i].brain.snakeScore;
                }

                if (sketches[i].brain.snakeScore > 20) {
                    //download(sketches[i].brain.genes, 'Score' + sketches[i].brain.snakeScore + '.json', 'text/plain');
                }

            }

            averageScore = (averageScore * 1.0 / population.maxPop).toFixed(2);
            document.getElementById("averageScoreID").innerHTML = averageScore;

            if (maxScore > highScore) {
                highScore = maxScore;
                console.log("HIGHSCORE: " + highScore);
            }

            population.naturalSelection();
            population.generate();

            for (let i = 0; i < population.population.length; i++) {
                window.clearInterval(sketches[i].brain.intervalID);
                sketches[i].remove();
                sketches[i] = (new p5(fct, 'firstSpan1'));
                sketches[i].brain = population.population[i];
                sketches[i].brain.alive = true;
                sketches[i].brain.id = i;
            }

        }
    }, 1000);
}

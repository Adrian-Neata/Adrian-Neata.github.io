class Population {
    constructor(maxpop, nrInputs) {
        this.maxPop = maxpop;
        this.mutationRate = 0;
        this.generation = 0;
        this.sumFit = 0; // trebuie sa calculez suma tuturor scorurilor obtinute de membrii populatiei
        this.topPercentage = 0.2;
        this.population = [];
        this.matingPool = [];

        this.settingsOptionsBreeding = {
            randomMating: 0,
            bestMutated: 1,
            bestWithEveryone: 2
        };

        this.settingsOptionsSelection = {
            bestDiversity: 0,
            bestScores: 1
        };

        this.settingsOptionsBestSeed = {
            keepBestSeedOff: 0,
            keepBestSeedOn: 1
        };

        this.settings = [this.settingsOptionsSelection.bestDiversity,
                         this.settingsOptionsBreeding.randomMating,
                         this.settingsOptionsBestSeed.keepBestSeedOff];

        for (let i = 0; i < this.maxPop; i++)
            this.population.push(new Snake(nrInputs));

    }

    /* sets how the population will evolve 
     1st param -> mutation rate
     2nd param -> selection settings
     3rd param -> breeding settings 
     4th param -> best seeds settings */
    set(mutationRate, settingsList) {
        this.mutationRate = mutationRate;
        this.settings = settingsList;
    }

    makePositiveFitness() { //face toate scorurile cel putin egale cu 0
        let lowest = 999999;
        for (let i = 0; i < this.population.length; i++) {
            if (lowest > this.population[i].score)
                lowest = this.population[i].score;
        }
        if (lowest < 0) {
            for (let i = 0; i < this.population.length; i++) {
                this.population[i].score += Math.abs(lowest) + 1;
            }
        }

        this.sumFit = 0;
        for (let i = 0; i < this.population.length; i++)
            this.sumFit += this.population[i].score;
        console.log("sumfit = " + this.sumFit);
    }

    naturalSelection() {
        console.log("Generation: " + this.generation);
        this.makePositiveFitness();

        this.matingPool = [];

        switch (this.settings[0]) {
            case this.settingsOptionsSelection.bestDiversity:
                for (let i = 0; i < this.population.length * 10; i++) //de 10 ori dim populatiei
                {
                    let chance = Math.random() * this.sumFit;
                    let ind = -1;
                    while (chance > 0) {
                        ind++;
                        chance -= this.population[ind].score;
                    }

                    if (ind === -1)
                        ind++;
                    if (this.population[ind].score < minimumScore) {
                        this.population[ind].randomizeGenes();
                        this.matingPool.push(this.population[ind]);
                    }
                }
                break;
            case this.settingsOptionsSelection.bestScores:
                /* selects best topPercentage % individuals for breeding */
                this.population.sort((a, b) => (a.score > b.score) ? -1 : 1);

                for (let i = 0; i < Math.floor(this.population.length * this.topPercentage); i++) {
                    this.matingPool.push(this.population[i]);
                }
                break;
        }

    }

    generate() {
        let maxim = - 100;
        let ind = 0;
        let best = this.population[ind];

        for (let i = 0; i < this.population.length; i++) {
            if (maxim < this.population[i].score) {
                ind = i;
                maxim = this.population[i].score;
            }
        }

        best = this.population[ind];

        switch (this.settings[1]) {
            /* randomly breeds individuals */
            case this.settingsOptionsBreeding.randomMating:

                for (let i = 0; i < this.population.length; i++) {
                    let ind1 = Math.floor(Math.random() * this.matingPool.length);
                    let ind2 = Math.floor(Math.random() * this.matingPool.length);
                    let partner1 = this.matingPool[ind1];
                    let partner2 = this.matingPool[ind2];
                    let child = partner1.crossover2(partner2);
                    child.mutate(this.mutationRate);
                    this.population[i] = child;
                }
                break;
            /* selects best individual and fills the population with mutations */
            case this.settingsOptionsBreeding.bestMutated:

                for (let i = 0; i < this.population.length; i++) {
                    if (!powerups) {
                        this.population[i] = new Snake(6);
                    } else {
                        this.population[i] = new Snake(11);
                    }
                    if (maxim > population.maxPop * 60 / 100)
                        this.population[i].loadGenes(best.genes);
                    else {
                        this.population[i].randomizeGenes();
                    }
                    this.population[i].mutate(this.mutationRate);
                }
                break;
            /* selects best individual and breeds him randomly with the others */
            case this.settingsOptionsBreeding.bestWithEveryone:

                for (let i = 0; i < this.maxPop; i++) {
                    let ind2 = Math.floor(Math.random() * this.matingPool.length);
                    let partner1 = best;
                    let partner2 = this.matingPool[ind2];
                    let child = partner1.crossover2(partner2);
                    child.mutate(this.mutationRate);
                    this.population[i] = child;
                }
                break;
        }

        switch (this.settings[2]) {
            case this.settingsOptionsBestSeed.keepBestSeedOn:
                this.population[0] = new Snake(best.nrInputs);
                this.population[0].loadGenes(best.genes);
        }
        for (let i = 0; i < this.maxPop; i++) {
            this.population[i].score = 0;
            this.population[i].trainOnlyOneDirectionPossible();
            this.population[i].trainOnlyTwoDirectionPossible();
        }
        this.generation++;
    }
}
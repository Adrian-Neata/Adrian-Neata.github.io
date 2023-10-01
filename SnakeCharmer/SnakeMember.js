class Snake {
    constructor(nrInputs) {
        this.id;
        this.alive = true;
        this.nrInputs = nrInputs;
        this.score = 0;
        this.snakeScore = 0;
        this.genes = [];
        this.genesSize = Math.pow(2, this.nrInputs);

        this.randomizeGenes();
        this.trainOnlyOneDirectionPossible();
        this.trainOnlyTwoDirectionPossible();
    }

    loadGenes(genes) {
        if (genes.length != this.genes.length) {
            throw "Different genes lengths.";
        }
        this.genes = genes;
    }

    randomizeGenes() {
        for (var i = 0; i < this.genesSize; i++) {
            this.genes[i] = getRandomInt(3);
        }
        this.trainOnlyOneDirectionPossible();
        this.trainOnlyTwoDirectionPossible();
    }

    printGenes() {
        var s = '';

        for (var i = 0; i < this.genes.length; i++) {
            s += this.genes[i];
            if (i % 8 == 7) {
                s += ',\n';
            } else {
                s += ', ';
            }
        }
        console.log(s);
    }

    trainOnlyOneDirectionPossible() {
        let start = 0;
        let stop = 0;

        //JUST LEFT
        /* from 1000000... to 1001111... */
        start = Math.pow(2, this.nrInputs - 1);
        stop = Math.pow(2, this.nrInputs - 1) + Math.pow(2, this.nrInputs - 3);
        for (var i = start; i < stop; i++) {
            this.genes[i] = 0;
        }

        //JUST STRAIGHT
        /* from 0100000... to 0101111... */
        start = Math.pow(2, this.nrInputs - 2);
        stop = Math.pow(2, this.nrInputs - 2) + Math.pow(2, this.nrInputs - 3);
        for (var i = start; i < stop; i++) {
            this.genes[i] = 1;
        }

        //JUST UP
        /* from 0010000... to 0011111... */
        start = Math.pow(2, this.nrInputs - 3);
        stop = Math.pow(2, this.nrInputs - 2);
        for (var i = start; i < stop; i++) {
            this.genes[i] = 2;
        }
    }

    trainOnlyTwoDirectionPossible() {
        let start = 0;
        let stop = 0;
        let count1, count2;

        //JUST LEFT AND STRAIGHT
        /* from 1100000... to 1101111... */
        start = Math.pow(2, this.nrInputs - 1) + Math.pow(2, this.nrInputs - 2);
        stop = start + Math.pow(2, this.nrInputs - 3);
        count1 = 0;
        count2 = 0;
        for (var i = start; i < stop; i++) {
            if (getRandomInt(2) == 0) {
                this.genes[i] = 0;
                count1++;
            } else {
                this.genes[i] = 1;
                count2++;
            }
        }
        /* avoid large cycles */
        if (count1 == 0) {
            this.genes[start + getRandomInt(Math.pow(2, this.nrInputs - 3))] = 0;
        } else if (count2 == 0) {
            this.genes[start + getRandomInt(Math.pow(2, this.nrInputs - 3))] = 1;
        }

        //JUST STRAIGHT AND RIGHT
        /* from 0110000... to 0111111... */
        start = Math.pow(2, this.nrInputs - 2) + Math.pow(2, this.nrInputs - 3);
        stop = start + Math.pow(2, this.nrInputs - 3);
        count1 = 0;
        count2 = 0;
        for (var i = start; i < stop; i++) {
            if (getRandomInt(2) == 0) {
                this.genes[i] = 1;
                count1++;
            } else {
                this.genes[i] = 2;
                count2++;
            }
        }
        /* avoid large cycles */
        if (count1 == 0) {
            this.genes[start + getRandomInt(Math.pow(2, this.nrInputs - 3))] = 1;
        } else if (count2 == 0) {
            this.genes[start + getRandomInt(Math.pow(2, this.nrInputs - 3))] = 2;
        }

        //JUST RIGHT AND LEFT
        /* from 1010000... to 1011111... */
        start = Math.pow(2, this.nrInputs - 3) + Math.pow(2, this.nrInputs - 1);
        stop = start + Math.pow(2, this.nrInputs - 3);
        count1 = 0;
        count2 = 0;
        for (var i = start; i < stop; i++) {
            if (getRandomInt(2) == 0) {
                this.genes[i] = 0;
                count1++;
            } else {
                this.genes[i] = 2;
                count2++;
            }
        }
                /* avoid large cycles */
        if (count1 == 0) {
            this.genes[start + getRandomInt(Math.pow(2, this.nrInputs - 3))] = 0;
        } else if (count2 == 0) {
            this.genes[start + getRandomInt(Math.pow(2, this.nrInputs - 3))] = 2;
        }
    }

    predict(inputArray) {
        let outputIndex = 0;

        if (inputArray.length != this.nrInputs) {
            throw "Different input size.";
        }

        for (var i = 0; i < inputArray.length; i++) {
            if (inputArray[i] == 1) {
                outputIndex += Math.pow(2, inputArray.length - 1 - i);
            }
        }

        if (outputIndex > this.genesSize) {
            throw "Genes index out of bounds.";
        }

        return this.genes[outputIndex];
    }

    crossover(mate) {
        if (mate.genes.length != this.genes.length) {
            throw "Different genes lengths.";
        }

        var child = new Snake(this.nrInputs);

        for (var i = 0; i < this.genesSize; i++) {
            if (getRandomInt(2) == 0) {
                child.genes[i] = this.genes[i];
            } else {
                child.genes[i] = mate.genes[i];
            }
        }

        return child;
    }

    copyMoveBehaviour(child, parent, behaviour) {
        var start = behaviour * Math.pow(2, this.nrInputs - 3);
        var stop = start + this.genesSize / 8;

        for (var i = start; i < stop; i++) {
            child.genes[i] = parent.genes[i];
        }
    }

    copyFoodBehaviour(child, parent, behaviour) {
        var start = behaviour * Math.pow(2, this.nrInputs - 6);
        var stop = Math.pow(2, this.nrInputs) - (7 - behaviour) * Math.pow(2, this.nrInputs - 6);

        for (var i = start; i < stop; i += Math.pow(2, this.nrInputs - 3)) {
            child.genes[i] = parent.genes[i];
        }
    }

    copyPowerupBehaviour(child, parent, behaviour) {
        var start = behaviour;
        var stop = start + Math.pow(2, this.nrInputs) - 32;

        for (var i = start; i < stop; i += Math.pow(2, this.nrInputs - 6)) {
            child.genes[i] = parent.genes[i];
        }
    }

    crossover2(mate) {
        if (mate.genes.length != this.genes.length) {
            throw "Different genes lengths.";
        }
        var child = new Snake(this.nrInputs);
        var whichBehaviour;

        if (powerups) {
            whichBehaviour = getRandomInt(3);
        } else {
            whichBehaviour = getRandomInt(2);
        }

        if (whichBehaviour == 2) {
            for (var i = 0; i < 32; i++) {
                if (getRandomInt(2) == 0) {
                    this.copyPowerupBehaviour(child, this, i);
                } else {
                    this.copyPowerupBehaviour(child, mate, i);
                }
            }
        } else {
            for (var i = 0; i < 8; i++) {
                if (whichBehaviour == 0) {
                    if (getRandomInt(2) == 0) {
                        this.copyMoveBehaviour(child, this, i);
                    } else {
                        this.copyMoveBehaviour(child, mate, i);
                    }
                } else {
                    if (getRandomInt(2) == 0) {
                        this.copyFoodBehaviour(child, this, i);
                    } else {
                        this.copyFoodBehaviour(child, mate, i);
                    }
                }
            }
        }
        return child;
    }

    mutateGene(geneIndex) {
        let start = 0;
        let stop = 0;

        //JUST LEFT
        /* from 1000000... to 1001111... */
        start = Math.pow(2, this.nrInputs - 1);
        stop = Math.pow(2, this.nrInputs - 1) + Math.pow(2, this.nrInputs - 3);
        if (geneIndex >= start && geneIndex < stop) {
            return;
        }

        //JUST STRAIGHT
        /* from 0100000... to 0101111... */
        start = Math.pow(2, this.nrInputs - 2);
        stop = Math.pow(2, this.nrInputs - 2) + Math.pow(2, this.nrInputs - 3);
        if (geneIndex >= start && geneIndex < stop) {
            return;
        }

        //JUST UP
        /* from 0010000... to 0011111... */
        start = Math.pow(2, this.nrInputs - 3);
        stop = Math.pow(2, this.nrInputs - 2);
        if (geneIndex >= start && geneIndex < stop) {
            return;
        }

        //JUST LEFT AND STRAIGHT
        /* from 1100000... to 1101111... */
        start = Math.pow(2, this.nrInputs - 1) + Math.pow(2, this.nrInputs - 2);
        stop = start + Math.pow(2, this.nrInputs - 3);
        if (geneIndex >= start && geneIndex < stop) {
            if (this.genes[geneIndex] == 0) {
                this.genes[geneIndex] = 1;
            } else {
                this.genes[geneIndex] = 0;
            }
            return;
        }

        //JUST STRAIGHT AND RIGHT
        /* from 0110000... to 0111111... */
        start = Math.pow(2, this.nrInputs - 2) + Math.pow(2, this.nrInputs - 3);
        stop = start + Math.pow(2, this.nrInputs - 3);
        if (geneIndex >= start && geneIndex < stop) {
            if (this.genes[geneIndex] == 1) {
                this.genes[geneIndex] = 2;
            } else {
                this.genes[geneIndex] = 1;
            }
            return;
        }

        //JUST RIGHT AND LEFT
        /* from 1010000... to 1011111... */
        start = Math.pow(2, this.nrInputs - 3) + Math.pow(2, this.nrInputs - 1);
        stop = start + Math.pow(2, this.nrInputs - 3);
        if (geneIndex >= start && geneIndex < stop) {
            if (this.genes[geneIndex] == 2) {
                this.genes[geneIndex] = 0;
            } else {
                this.genes[geneIndex] = 2;
            }
            return;
        }

        this.genes[geneIndex] = getRandomInt(3);
    }

    mutate(mutationFactor) {
        for (var i = 0; i < this.genesSize; i++) {
            if (Math.random() < mutationFactor) {
                this.mutateGene(i);
            }
        }
        this.trainOnlyOneDirectionPossible();
        this.trainOnlyTwoDirectionPossible();
    }
}
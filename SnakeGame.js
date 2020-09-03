class SnakeGame {

    constructor(posX, posY, namespace) {
        this.grid = new Array(25);
        for (var i = 0; i < 25; i++) {
            this.grid[i] = new Array(25);
            for (var j = 0; j < 25; j++) {
                this.grid[i][j] = objectsInGrid.EMPTY;
            }
        }

        this.gameOver = false;
        this.p = namespace
        this.headX = posX;
        this.headY = posY;

        this.foodPos;
        this.foodColor;
        this.foodSize = 20;
        this.foodPadding = 12;
        this.oldFoodColor;

        this.powerupPos = this.p.createVector(-1, -1);;
        this.powerupActive = false;
        this.lastPowerup;

        this.colorIndex = 0;

        this.snakeSize = 25;
        this.direction = direction.RIGHT;

        this.grid[posY][posX] = objectsInGrid.HEAD;

        this.snakeBody = [this.p.createVector(posX, posY)];
        this.bodyColors = [this.p.createVector(0, 0, 0)];

        this.ateFood = false;
        this.totalScore = 0;
        this.alive = 1;

        for (let i = 1; i < document.getElementById("startingBodySize").value; i++) {
            this.snakeBody.push(this.p.createVector(4 - i, 4));
            this.bodyColors.push(this.p.createVector(250, 50, 50));
        }

        document.getElementById("scoreID").innerHTML = this.totalScore;
    }

    hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? this.p.createVector(
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ) : null;
    }

    resize5TimesSmaller() {
        this.foodSize = 4;
        this.foodPadding = 2;
        this.snakeSize = 5;
        if (this.gameOver) {
            this.p.background(55);
            this.drawStatic();
            this.p.fill(255, 255, 255);
            this.p.text(this.p.brain.id, 60, 60);
        }
    }

    resizeToDefault() {
        this.foodSize = 20;
        this.foodPadding = 12;
        this.snakeSize = 25;
        if (this.gameOver) {
            this.p.background(55);
            this.drawStatic();
            this.p.fill(255, 255, 255);
            this.p.textSize(36);
            this.p.text(this.p.brain.id, 300, 300);
        }
    }

    generateFood() {
        let x, y;
        do {
            x = getRandomInt(25);
            y = getRandomInt(25);
        } while (this.checkFoodBodyCollision(x, y) === true);

        this.foodPos = this.p.createVector(x, y);
        this.oldFoodColor = this.foodColor;
        if (rainbowSnake) {
            this.foodColor = this.hexToRgb(rainbowColors[this.colorIndex]);
            this.colorIndex = this.colorIndex + 1;
            if (this.colorIndex == 7) {
                this.colorIndex = 0;
            }
        } else {
            let r = getRandomInt(256);
            let g = getRandomInt(256);
            let b = getRandomInt(256);
            this.foodColor = this.p.createVector(r, g, b);
        }

        this.grid[y][x] = objectsInGrid.FOOD;

        if (getRandomInt(100) < document.getElementById("powerupsFrequency").value) {
            this.generatePowerUp();
        }
    }

    drawPowerUp5X() {
        this.p.fill(75, 158, 12);
        this.p.stroke(75, 158, 12);
        this.p.triangle(this.powerupPos.x * this.snakeSize + this.snakeSize * 0.5,
            this.powerupPos.y * this.snakeSize + this.snakeSize * 0.2,
            this.powerupPos.x * this.snakeSize + this.snakeSize * 0.4,
            this.powerupPos.y * this.snakeSize,
            this.powerupPos.x * this.snakeSize + this.snakeSize * 0.6,
            this.powerupPos.y * this.snakeSize);
        this.p.fill(114, 67, 4);
        this.p.stroke(114, 67, 4);
        this.p.triangle(this.powerupPos.x * this.snakeSize + this.snakeSize * 0.5,
            this.powerupPos.y * this.snakeSize + this.snakeSize * 0.85,
            this.powerupPos.x * this.snakeSize + this.snakeSize * 0.44,
            this.powerupPos.y * this.snakeSize + this.snakeSize,
            this.powerupPos.x * this.snakeSize + this.snakeSize * 0.55,
            this.powerupPos.y * this.snakeSize + this.snakeSize);
        this.p.fill(200, 44, 28);
        this.p.stroke(200, 44, 28);
        this.p.ellipse(this.powerupPos.x * this.snakeSize + this.snakeSize * 0.25,
            this.powerupPos.y * this.snakeSize + this.snakeSize * 0.55, this.snakeSize * 0.7, this.snakeSize * 0.85);
        this.p.fill(200, 44, 28);
        this.p.stroke(200, 44, 28);
        this.p.ellipse(this.powerupPos.x * this.snakeSize + this.snakeSize * 0.75,
            this.powerupPos.y * this.snakeSize + this.snakeSize * 0.55, this.snakeSize * 0.7, this.snakeSize * 0.85);
        this.p.stroke(0, 0, 0);
    }

    drawPowerUpShort() {
        this.p.fill(251, 244, 23 );
        this.p.stroke(251, 244, 23 );
        this.p.triangle(this.powerupPos.x * this.snakeSize + this.snakeSize * 0.5,
            this.powerupPos.y * this.snakeSize,
            this.powerupPos.x * this.snakeSize + this.snakeSize * 0.3,
            this.powerupPos.y * this.snakeSize + this.snakeSize*0.5,
            this.powerupPos.x * this.snakeSize + this.snakeSize * 0.7,
            this.powerupPos.y * this.snakeSize + this.snakeSize*0.5);
        this.p.triangle(this.powerupPos.x * this.snakeSize,
            this.powerupPos.y * this.snakeSize + this.snakeSize * 0.5,
            this.powerupPos.x * this.snakeSize + this.snakeSize * 0.5,
            this.powerupPos.y * this.snakeSize + this.snakeSize*0.3,
            this.powerupPos.x * this.snakeSize + this.snakeSize * 0.5,
            this.powerupPos.y * this.snakeSize + this.snakeSize*0.7);
        this.p.triangle(this.powerupPos.x * this.snakeSize + this.snakeSize,
            this.powerupPos.y * this.snakeSize + this.snakeSize * 0.5,
            this.powerupPos.x * this.snakeSize + this.snakeSize * 0.5,
            this.powerupPos.y * this.snakeSize + this.snakeSize*0.3,
            this.powerupPos.x * this.snakeSize + this.snakeSize * 0.5,
            this.powerupPos.y * this.snakeSize + this.snakeSize*0.7);
        this.p.triangle(this.powerupPos.x * this.snakeSize + this.snakeSize * 0.3,
            this.powerupPos.y * this.snakeSize + this.snakeSize,
            this.powerupPos.x * this.snakeSize + this.snakeSize * 0.2,
            this.powerupPos.y * this.snakeSize + this.snakeSize*0.5,
            this.powerupPos.x * this.snakeSize + this.snakeSize * 0.6,
            this.powerupPos.y * this.snakeSize + this.snakeSize*0.5);
        this.p.triangle(this.powerupPos.x * this.snakeSize + this.snakeSize * 0.7,
            this.powerupPos.y * this.snakeSize + this.snakeSize,
            this.powerupPos.x * this.snakeSize + this.snakeSize * 0.4,
            this.powerupPos.y * this.snakeSize + this.snakeSize*0.5,
            this.powerupPos.x * this.snakeSize + this.snakeSize * 0.8,
            this.powerupPos.y * this.snakeSize + this.snakeSize*0.5);

        this.p.stroke(0, 0, 0);
    }

    drawPowerUpDevil() {
        this.p.fill(142, 29, 202);
        this.p.stroke(142, 29, 202);
        this.p.triangle(this.powerupPos.x * this.snakeSize + this.snakeSize * 0.3,
            this.powerupPos.y * this.snakeSize,
            this.powerupPos.x * this.snakeSize + this.snakeSize * 0.25,
            this.powerupPos.y * this.snakeSize + this.snakeSize * 0.3,
            this.powerupPos.x * this.snakeSize + this.snakeSize * 0.4,
            this.powerupPos.y * this.snakeSize + this.snakeSize * 0.3);
        this.p.fill(142, 29, 202);
        this.p.triangle(this.powerupPos.x * this.snakeSize + this.snakeSize * 0.7,
            this.powerupPos.y * this.snakeSize,
            this.powerupPos.x * this.snakeSize + this.snakeSize * 0.55,
            this.powerupPos.y * this.snakeSize + this.snakeSize * 0.3,
            this.powerupPos.x * this.snakeSize + this.snakeSize * 0.75,
            this.powerupPos.y * this.snakeSize + this.snakeSize * 0.3);
        this.p.fill(142, 29, 202);
        this.p.ellipse(this.powerupPos.x * this.snakeSize + this.snakeSize * 0.5,
            this.powerupPos.y * this.snakeSize + this.snakeSize * 0.55, this.snakeSize * 0.9);
        this.p.stroke(0, 0, 0);
        this.p.fill(0, 0, 0);
        this.p.ellipse(this.powerupPos.x * this.snakeSize + this.snakeSize * 0.3,
            this.powerupPos.y * this.snakeSize + this.snakeSize * 0.35, this.snakeSize * 0.15);
        this.p.fill(0, 0, 0);
        this.p.ellipse(this.powerupPos.x * this.snakeSize + this.snakeSize * 0.7,
            this.powerupPos.y * this.snakeSize + this.snakeSize * 0.35, this.snakeSize * 0.15);
        this.p.stroke(56, 126, 176 );
        this.p.fill(56, 126, 176 );
        this.p.rect(this.powerupPos.x * this.snakeSize + this.snakeSize * 0.3,
            this.powerupPos.y * this.snakeSize + this.snakeSize * 0.7, 
            this.foodSize * 0.4, this.snakeSize * 0.1, 7, 7, 1, 1);
        this.p.stroke(0, 0, 0);
    }

    drawPowerUp() {
        if (this.powerupActive == true) {
            switch (this.grid[this.powerupPos.y][this.powerupPos.x]) {
                case objectsInGrid.POWERUP_SHORT:
                    this.drawPowerUpShort();
                    break;
                case objectsInGrid.POWERUP_5X:
                    this.drawPowerUp5X();
                    break;
                case objectsInGrid.POWERUP_DEVIL:
                    this.drawPowerUpDevil();
                    break;
            }
        }
    }

    generatePowerUp() {
        let typeOfPowerup;
        let x, y;
        do {
            x = getRandomInt(25);
            y = getRandomInt(25);
        } while (this.checkFoodBodyCollision(x, y) === true);

        this.powerupPos = this.p.createVector(x, y);

        typeOfPowerup = getRandomInt(3);
        switch (typeOfPowerup) {
            case 0:
                this.grid[y][x] = objectsInGrid.POWERUP_SHORT;
                this.lastPowerup = objectsInGrid.POWERUP_SHORT;
                break;
            case 1:
                this.grid[y][x] = objectsInGrid.POWERUP_5X;
                this.lastPowerup = objectsInGrid.POWERUP_5X;
                break;
            case 2:
                this.grid[y][x] = objectsInGrid.POWERUP_DEVIL;
                this.lastPowerup = objectsInGrid.POWERUP_DEVIL;
                break;
        }
        this.powerupActive = true;
    }

    /* returns [0, 0] if no powerup spawned, [0, 1] if POWERUP_SHORT, [1, 0] if POWERUP_5X or [1, 1] if POWERUP_DEVIL */
    whichPowerup() {
        if (this.powerupActive == false) {
            return [0, 0];
        } else {
            if (this.lastPowerup == objectsInGrid.POWERUP_SHORT) {
                return [0, 1];
            } else if (this.lastPowerup == objectsInGrid.POWERUP_5X) {
                return [1, 0];
            } else if (this.lastPowerup == objectsInGrid.POWERUP_DEVIL) {
                return [1, 1];
            }
        }
    }
    /*draws head */
    drawSnake() {
        if (this.direction == direction.RIGHT) {
            this.p.fill(241, 198, 68);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.5,
                this.snakeBody[0].y * this.snakeSize, this.snakeSize/3, this.snakeSize/3);
            
            this.p.fill(241, 198, 68);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.5,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize, this.snakeSize/3, this.snakeSize/3);

            this.p.fill(241, 230, 68);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.55,
                this.snakeBody[0].y * this.snakeSize, this.snakeSize/5, this.snakeSize/3.5);
            
            this.p.fill(241, 230, 68);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.55,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize, this.snakeSize/5, this.snakeSize/3.5);

            this.p.fill(0, 0, 0);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.6,
                this.snakeBody[0].y * this.snakeSize, this.snakeSize/10, this.snakeSize/10);
            
            this.p.fill(0, 0, 0);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.6,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize, this.snakeSize/10, this.snakeSize/10);

            this.p.fill(43, 184, 25);
            this.p.stroke(43, 184, 25);
            this.p.triangle(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.5,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize/2,
                this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.7,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize*0.18,
                this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.7,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize*0.84);

            this.p.fill(43, 184, 25);
            this.p.rect(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.7,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize*0.16, this.snakeSize * 0.25,
                this.snakeSize * 0.7, 1, 9, 9, 1);

            this.p.fill(57, 110, 0);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.8,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize * 0.6, this.snakeSize/7, this.snakeSize/7);

            this.p.fill(57, 110, 0);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.8,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize * 0.4, this.snakeSize/7, this.snakeSize/7);


            this.p.stroke(0, 0, 0);
        } else if (this.direction == direction.LEFT) {
            this.p.fill(241, 198, 68);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.5,
                this.snakeBody[0].y * this.snakeSize, this.snakeSize/3, this.snakeSize/3);
            
            this.p.fill(241, 198, 68);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.5,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize, this.snakeSize/3, this.snakeSize/3);

            this.p.fill(241, 230, 68);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.45,
                this.snakeBody[0].y * this.snakeSize, this.snakeSize/5, this.snakeSize/3.5);
            
            this.p.fill(241, 230, 68);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.45,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize, this.snakeSize/5, this.snakeSize/3.5);

            this.p.fill(0, 0, 0);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.4,
                this.snakeBody[0].y * this.snakeSize, this.snakeSize/10, this.snakeSize/10);
            
            this.p.fill(0, 0, 0);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.4,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize, this.snakeSize/10, this.snakeSize/10);

            this.p.fill(43, 184, 25);
            this.p.stroke(43, 184, 25);
            this.p.triangle(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.5,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize/2,
                this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.28,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize*0.18,
                this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.28,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize*0.84);

            this.p.fill(43, 184, 25);
            this.p.rect(this.snakeBody[0].x * this.snakeSize,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize*0.16, this.snakeSize * 0.25,
                this.snakeSize * 0.7, 9, 1, 1, 9);

            this.p.fill(57, 110, 0);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.2,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize * 0.6, this.snakeSize/7, this.snakeSize/7);

            this.p.fill(57, 110, 0);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.2,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize * 0.4, this.snakeSize/7, this.snakeSize/7);


            this.p.stroke(0, 0, 0);
            } else if (this.direction == direction.UP) {
            this.p.fill(241, 198, 68);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize * 0.5, this.snakeSize/3, this.snakeSize/3);
            
            this.p.fill(241, 198, 68);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize,
                this.snakeBody[0].y * this.snakeSize + + this.snakeSize * 0.5, this.snakeSize/3, this.snakeSize/3);

            this.p.fill(241, 230, 68);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize * 0.45, this.snakeSize/3.5, this.snakeSize/5);
            
            this.p.fill(241, 230, 68);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize * 0.45, this.snakeSize/3.5, this.snakeSize/5);

            this.p.fill(0, 0, 0);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize * 0.4, this.snakeSize/10, this.snakeSize/10);
            
            this.p.fill(0, 0, 0);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize * 0.4, this.snakeSize/10, this.snakeSize/10);

            this.p.fill(43, 184, 25);
            this.p.stroke(43, 184, 25);
            this.p.triangle(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.5,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize/2,
                this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.15,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize*0.25,
                this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.85,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize*0.25);

            this.p.fill(43, 184, 25);
            this.p.rect(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.16,
                this.snakeBody[0].y * this.snakeSize, this.snakeSize * 0.7,
                this.snakeSize * 0.25, 9, 9, 1, 1);

            this.p.fill(57, 110, 0);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.6,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize * 0.2, this.snakeSize/7, this.snakeSize/7);

            this.p.fill(57, 110, 0);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.4,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize * 0.2, this.snakeSize/7, this.snakeSize/7);


            this.p.stroke(0, 0, 0);
            } else if (this.direction == direction.DOWN) {
            this.p.fill(241, 198, 68);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize * 0.5, this.snakeSize/3, this.snakeSize/3);
            
            this.p.fill(241, 198, 68);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize,
                this.snakeBody[0].y * this.snakeSize + + this.snakeSize * 0.5, this.snakeSize/3, this.snakeSize/3);

            this.p.fill(241, 230, 68);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize * 0.55, this.snakeSize/3.5, this.snakeSize/5);
            
            this.p.fill(241, 230, 68);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize * 0.55, this.snakeSize/3.5, this.snakeSize/5);

            this.p.fill(0, 0, 0);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize * 0.6, this.snakeSize/10, this.snakeSize/10);
            
            this.p.fill(0, 0, 0);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize * 0.6, this.snakeSize/10, this.snakeSize/10);

            this.p.fill(43, 184, 25);
            this.p.stroke(43, 184, 25);
            this.p.triangle(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.5,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize/2,
                this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.15,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize*0.75,
                this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.85,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize*0.75);

            this.p.fill(43, 184, 25);
            this.p.rect(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.16,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize * 0.75, this.snakeSize * 0.7,
                this.snakeSize * 0.25, 1, 1, 9, 9);

            this.p.fill(57, 110, 0);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.6,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize * 0.8, this.snakeSize/7, this.snakeSize/7);

            this.p.fill(57, 110, 0);
            this.p.ellipse(this.snakeBody[0].x * this.snakeSize + this.snakeSize * 0.4,
                this.snakeBody[0].y * this.snakeSize + this.snakeSize * 0.8, this.snakeSize/7, this.snakeSize/7);


            this.p.stroke(0, 0, 0);
            }
    }

    /* draws the snake without moving it */
    drawStatic() {
        this.p.fill(this.foodColor.x, this.foodColor.y, this.foodColor.z);
        this.p.ellipse(this.foodPos.x * this.snakeSize + this.foodPadding, this.foodPos.y * this.snakeSize + this.foodPadding, this.foodSize);

         this.drawPowerUp();

        this.p.fill(57, 110, 0);
        this.p.rect(this.snakeBody[0].x * this.snakeSize,
            this.snakeBody[0].y * this.snakeSize, this.snakeSize, this.snakeSize, 9);

        this.drawSnake();

        for (let i = 1; i < this.snakeBody.length; i++) {
            this.p.fill(this.bodyColors[i].x, this.bodyColors[i].y, this.bodyColors[i].z);
            this.p.rect(this.snakeBody[i].x * this.snakeSize,
                this.snakeBody[i].y * this.snakeSize, this.snakeSize, this.snakeSize, 7.5);
        }

    }

    /* draws the snake move */
    drawDynamic() {
        this.p.fill(this.foodColor.x, this.foodColor.y, this.foodColor.z);
        this.p.ellipse(this.foodPos.x * this.snakeSize + this.foodPadding, this.foodPos.y * this.snakeSize + this.foodPadding, this.foodSize);

        this.drawPowerUp();

        this.grid[this.headY][this.headX] = objectsInGrid.EMPTY;

        switch (this.direction) {
            case direction.UP:
                this.headY -= 1;
                break;
            case direction.DOWN:
                this.headY += 1;
                break;
            case direction.LEFT:
                this.headX -= 1;
                break;
            case direction.RIGHT:
                this.headX += 1;
                break;
        }

        /* the tail will be gone by the time the head reaches it */
        this.grid[this.snakeBody[this.snakeBody.length - 1].y][this.snakeBody[this.snakeBody.length - 1].x] = objectsInGrid.EMPTY;

        /* check if the next move will be game over */
        this.checkCollisions();

        if (this.gameOver == false) {
            /* adds new piece to the body */
            if (this.ateFood === true) {
                this.snakeBody.push(this.p.createVector(this.snakeBody[this.snakeBody.length - 1].x,
                    this.snakeBody[this.snakeBody.length - 1].y));
                this.bodyColors.push(this.oldFoodColor);
                this.totalScore++;
                if (document.getElementById("scoreID").innerHTML < this.totalScore) {
                    document.getElementById("scoreID").innerHTML = this.totalScore;
                }
            }

            /* moves head in grid */
            this.grid[this.headY][this.headX] = objectsInGrid.HEAD;

            for (let i = this.snakeBody.length - 1; i > 0; i--) {
                if (this.ateFood === false) {
                    this.snakeBody[i] = this.p.createVector(this.snakeBody[i - 1].x, this.snakeBody[i - 1].y);
                } else {
                    this.ateFood = false;
                }
                this.p.fill(this.bodyColors[i].x, this.bodyColors[i].y, this.bodyColors[i].z);
                this.p.rect(this.snakeBody[i].x * this.snakeSize,
                    this.snakeBody[i].y * this.snakeSize, this.snakeSize, this.snakeSize, 7.5);
                this.grid[this.snakeBody[i].y][this.snakeBody[i].x] = objectsInGrid.BODY;
            }

            /*draws head */
            this.snakeBody[0].x = this.headX;
            this.snakeBody[0].y = this.headY;
            this.p.fill(57, 110, 0);
            this.p.rect(this.snakeBody[0].x * this.snakeSize,
                this.snakeBody[0].y * this.snakeSize, this.snakeSize, this.snakeSize, 9);

            this.drawSnake();

            this.checkReachedFood();

            if (this.powerupActive == true) {
                this.checkReachedPowerup();
            }
        }
    }


    /* checks if snake ate food */
    checkReachedFood() {
        if (this.headX == this.foodPos.x && this.headY == this.foodPos.y) {
            this.ateFood = true;
            this.p.brain.score += 200.5 / 2; // FUNCTIA DE FITNESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS
            if (this.powerupActive) {
                this.powerupActive = false;
                this.grid[this.powerupPos.y][this.powerupPos.x] = objectsInGrid.EMPTY;
                }
            this.generateFood();
        }
    }

    /* checks if snake ate power-up */
    checkReachedPowerup() {
        if (this.headX == this.powerupPos.x && this.headY == this.powerupPos.y) {
            switch (this.lastPowerup) {
                case objectsInGrid.POWERUP_SHORT:
                    this.p.brain.score += 200.5 / 2; // FUNCTIA DE FITNESS
                    if (this.snakeBody.length > 1) {
                        this.grid[this.snakeBody[this.snakeBody.length - 1].y][this.snakeBody[this.snakeBody.length - 1].x] = objectsInGrid.EMPTY;
                        this.snakeBody.pop();
                        this.bodyColors.pop();
                    }
                    break;
                case objectsInGrid.POWERUP_5X:
                    this.p.brain.score += 5 * (200.5 / 2); // FUNCTIA DE FITNESS
                    this.totalScore += 4;
                    this.oldFoodColor = this.p.createVector(200, 44, 28);
                    break;
                case objectsInGrid.POWERUP_DEVIL:
                    this.p.brain.score -= 3 * (200.5 / 2); // FUNCTIA DE FITNESS
                    if (this.totalScore - 3 < 0) {
                        this.totalScore = 0;
                    } else {
                        this.totalScore -= 3;
                    }
                    if (document.getElementById("scoreID").innerHTML < this.totalScore) {
                        document.getElementById("scoreID").innerHTML = this.totalScore;
                    }
                    break;
            }
            this.powerupActive = false;
        }
    }


    /* checks if snake hit a wall or its own body */
    checkCollisions() {
        if (this.headX > 24 || this.headY > 24 ||
            this.headX < 0 || this.headY < 0) {
            this.gameOver = true;
            return;
        }
        if (this.grid[this.headY][this.headX] === objectsInGrid.BODY) {
            this.gameOver = true;
        }
    }

    /* checks if food overlaps snake */
    checkFoodBodyCollision(x, y) {
        if (this.grid[y][x] != objectsInGrid.EMPTY)
            return true;
        return false;
    }

    check1BlockLeft() {
        if (this.headX > 0 && this.headX < 25 && this.headY >= 0 && this.headY < 25) {
            if (this.grid[this.headY][this.headX - 1] != objectsInGrid.BODY ||
                (this.snakeBody[this.snakeBody.length - 1].x == this.headX - 1 &&
                    this.snakeBody[this.snakeBody.length - 1].y == this.headY)) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }

    check1BlockRight() {
        if (this.headX < 24 && this.headX >= 0 && this.headY >= 0 && this.headY < 25) {
            if (this.grid[this.headY][this.headX + 1] != objectsInGrid.BODY ||
                (this.snakeBody[this.snakeBody.length - 1].x == this.headX + 1 &&
                    this.snakeBody[this.snakeBody.length - 1].y == this.headY)) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }

    check1BlockUp() {
        if (this.headY > 0 && this.headX < 25 && this.headX >= 0 && this.headY < 25) {
            if (this.grid[this.headY - 1][this.headX] != objectsInGrid.BODY ||
                (this.snakeBody[this.snakeBody.length - 1].x == this.headX &&
                    this.snakeBody[this.snakeBody.length - 1].y == this.headY - 1)) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }

    check1BlockDown() {
        if (this.headY < 24 && this.headX >= 0 && this.headY >= 0 && this.headX < 25) {
            if (this.grid[this.headY + 1][this.headX] != objectsInGrid.BODY ||
                (this.snakeBody[this.snakeBody.length - 1].x == this.headX &&
                    this.snakeBody[this.snakeBody.length - 1].y == this.headY + 1)) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }
   /* left, straight, right relative to snake direction */
    possibleHeadCollision() {
        let list = [];
        switch (this.direction) {
            case direction.UP:
                /* LEFT */
                list.push(this.check1BlockLeft());

                /* UP */
                list.push(this.check1BlockUp());

                /* RIGHT */
                list.push(this.check1BlockRight());
                break;
            case direction.DOWN:
                /* RIGHT */
                list.push(this.check1BlockRight());

                /* DOWN */
                list.push(this.check1BlockDown());

                /* LEFT */
                list.push(this.check1BlockLeft());

                break;
            case direction.RIGHT:
                /* UP */
                list.push(this.check1BlockUp());

                /* RIGHT */
                list.push(this.check1BlockRight());

                /* DOWN */
                list.push(this.check1BlockDown());
                break;
            case direction.LEFT:
                /* DOWN */
                list.push(this.check1BlockDown());

                /* LEFT */
                list.push(this.check1BlockLeft());

                /* UP */
                list.push(this.check1BlockUp());
                break;
        }

        return list;
    }

    /* left, straight, right relative to snake direction */
    foodDirections() {
        let list = [];
        switch (this.direction) {
            case direction.UP:

                /* LEFT */
                if (this.headX > this.foodPos.x) {
                    list.push(1);
                } else {
                    list.push(0);
                }

                /* UP */
                if (this.headY > this.foodPos.y) {
                    list.push(1);
                } else {
                    list.push(0);
                }

                /* RIGHT */
                if (this.headX < this.foodPos.x) {
                    list.push(1);
                } else {
                    list.push(0);
                }
                break;
            case direction.DOWN:

                /* RIGHT */
                if (this.headX < this.foodPos.x) {
                    list.push(1);
                } else {
                    list.push(0);
                }

                /* DOWN */
                if (this.headY < this.foodPos.y) {
                    list.push(1);
                } else {
                    list.push(0);
                }

                /* LEFT */
                if (this.headX > this.foodPos.x) {
                    list.push(1);
                } else {
                    list.push(0);
                }

                break;
            case direction.RIGHT:
                /* UP */
                if (this.headY > this.foodPos.y) {
                    list.push(1);
                } else {
                    list.push(0);
                }

                /* RIGHT */
                if (this.headX < this.foodPos.x) {
                    list.push(1);
                } else {
                    list.push(0);
                }

                /* DOWN */
                if (this.headY < this.foodPos.y) {
                    list.push(1);
                } else {
                    list.push(0);
                }
                break;
            case direction.LEFT:

                /* DOWN */
                if (this.headY < this.foodPos.y) {
                    list.push(1);
                } else {
                    list.push(0);
                }

                /* LEFT */
                if (this.headX > this.foodPos.x) {
                    list.push(1);
                } else {
                    list.push(0);
                }

                /* UP */
                if (this.headY > this.foodPos.y) {
                    list.push(1);
                } else {
                    list.push(0);
                }
                break;
        }
        return list;
    }

     /* left, straight, right relative to snake direction */
    powerupDirections() {
        let list = [];
        switch (this.direction) {
            case direction.UP:

                /* LEFT */
                if (this.headX > this.powerupPos.x) {
                    list.push(1);
                } else {
                    list.push(0);
                }

                /* UP */
                if (this.headY > this.powerupPos.y) {
                    list.push(1);
                } else {
                    list.push(0);
                }

                /* RIGHT */
                if (this.headX < this.powerupPos.x) {
                    list.push(1);
                } else {
                    list.push(0);
                }
                break;
            case direction.DOWN:

                /* RIGHT */
                if (this.headX < this.powerupPos.x) {
                    list.push(1);
                } else {
                    list.push(0);
                }

                /* DOWN */
                if (this.headY < this.powerupPos.y) {
                    list.push(1);
                } else {
                    list.push(0);
                }

                /* LEFT */
                if (this.headX > this.powerupPos.x) {
                    list.push(1);
                } else {
                    list.push(0);
                }

                break;
            case direction.RIGHT:
                /* UP */
                if (this.headY > this.powerupPos.y) {
                    list.push(1);
                } else {
                    list.push(0);
                }

                /* RIGHT */
                if (this.headX < this.powerupPos.x) {
                    list.push(1);
                } else {
                    list.push(0);
                }

                /* DOWN */
                if (this.headY < this.powerupPos.y) {
                    list.push(1);
                } else {
                    list.push(0);
                }
                break;
            case direction.LEFT:

                /* DOWN */
                if (this.headY < this.powerupPos.y) {
                    list.push(1);
                } else {
                    list.push(0);
                }

                /* LEFT */
                if (this.headX > this.powerupPos.x) {
                    list.push(1);
                } else {
                    list.push(0);
                }

                /* UP */
                if (this.headY > this.powerupPos.y) {
                    list.push(1);
                } else {
                    list.push(0);
                }
                break;
        }
        return list;
    }

    /* returns list of all possible directions with no collisions */
    checkForBodyCollision() {
        let list = [];
        if (this.headY > 0 && this.headY <= 24 && this.headX >= 0 && this.headX <= 24) {
            if (this.grid[this.headY - 1][this.headX] != objectsInGrid.BODY ||
                (this.snakeBody[this.snakeBody.length - 1].x == this.headX &&
                    this.snakeBody[this.snakeBody.length - 1].y == this.headY - 1)) {
                list.push(direction.UP);
            }
        }
        if (this.headY >= 0 && this.headY < 24 && this.headX >= 0 && this.headX <= 24)  {
            if (this.grid[this.headY + 1][this.headX] != objectsInGrid.BODY ||
                (this.snakeBody[this.snakeBody.length - 1].x == this.headX &&
                    this.snakeBody[this.snakeBody.length - 1].y == this.headY + 1)) {
                list.push(direction.DOWN);
            }
        }
        if ((this.headY >= 0 && this.headY <= 24 && this.headX > 0 && this.headX <= 24) ) {
            if (this.grid[this.headY][this.headX - 1] != objectsInGrid.BODY ||
                (this.snakeBody[this.snakeBody.length - 1].x == this.headX - 1 &&
                    this.snakeBody[this.snakeBody.length - 1].y == this.headY)) {
                list.push(direction.LEFT);
            }
        }
        if ((this.headY >= 0 && this.headY <= 24 && this.headX >= 0 && this.headX < 24) ) {
            if (this.grid[this.headY][this.headX + 1] != objectsInGrid.BODY ||
                (this.snakeBody[this.snakeBody.length - 1].x == this.headX + 1 &&
                    this.snakeBody[this.snakeBody.length - 1].y == this.headY)) {
                list.push(direction.RIGHT);
            }
        }
        return list;
    }

    /* only ifs used ~40 points*/
    autoPlay() {
        let dir = this.direction;
        if (this.direction == direction.RIGHT) {
            /* snake goes to the right*/
            if (this.foodPos.x > this.headX) {
                /* snake goes the right direction */
            } else if (this.foodPos.x < this.headX) {
                if (this.headY == 0) {
                    /* too close to the upper border */
                    dir = direction.DOWN;
                } else if (this.headY == 24) {
                    /* too close to the lower border */
                    dir = direction.UP;
                } else {
                    if (this.foodPos.y < this.headY) {
                        dir = direction.UP;
                    } else {
                        dir = direction.DOWN;
                    }
                }
            } else if (this.foodPos.y < this.headY) {
                dir = direction.UP;
            } else if (this.foodPos.y > this.headY) {
                dir = direction.DOWN;
            }
        } else if (this.direction == direction.LEFT) {
            /* snake goes to the left*/
            if (this.foodPos.x > this.headX) {
                if (this.headY == 0) {
                    /* too close to the upper border */
                    dir = direction.DOWN;
                } else if (this.headY == 24) {
                    /* too close to the lower border */
                    dir = direction.UP;
                } else {
                    if (this.foodPos.y < this.headY) {
                        dir = direction.UP;
                    } else {
                        dir = direction.DOWN;
                    }
                }
            } else if (this.foodPos.x < this.headX) {
                /* snake goes the right direction */
            } else if (this.foodPos.y < this.headY) {
                dir = direction.UP;
            } else if (this.foodPos.y > this.headY) {
                dir = direction.DOWN;
            }
        } else if (this.direction == direction.DOWN) {
            /* snake goes downwards */
            if (this.foodPos.y < this.headY) {
                if (this.headX == 0) {
                    /* too close to the left border */
                    dir = direction.RIGHT;
                } else if (this.headX == 24) {
                    /* too close to the right border */
                    dir = direction.LEFT;
                } else {
                    if (this.foodPos.x < this.headX) {
                        dir = direction.LEFT;
                    } else {
                        dir = direction.RIGHT;
                    }
                }
            } else if (this.foodPos.y > this.headY) {
                /* snake goes the right direction */
            } else if (this.foodPos.x > this.headX) {
                dir = direction.RIGHT;
            } else if (this.foodPos.x < this.headX) {
                dir = direction.LEFT;
            }
        } else if (this.direction == direction.UP) {
            /* snake goes upwards */
            if (this.foodPos.y < this.headY) {
                /* snake goes the right direction */
            } else if (this.foodPos.y > this.headY) {
                if (this.headX == 0) {
                    /* too close to the left border */
                    dir = direction.RIGHT;
                } else if (this.headX == 24) {
                    /* too close to the right border */
                    dir = direction.LEFT;
                } else {
                    if (this.foodPos.x < this.headX) {
                        dir = direction.LEFT;
                    } else {
                        dir = direction.RIGHT;
                    }
                }
            } else if (this.foodPos.x > this.headX) {
                dir = direction.RIGHT;
            } else if (this.foodPos.x < this.headX) {
                dir = direction.LEFT;
            }
        }

        let resultCollisionsCheck = this.checkForBodyCollision();
        if (resultCollisionsCheck.includes(dir)) {
            this.direction = dir;
        } else {
            if (resultCollisionsCheck.length != 0) {
                this.direction = resultCollisionsCheck[0];
            }
        }
    }

}

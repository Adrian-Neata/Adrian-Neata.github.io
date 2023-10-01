let fct = function (p) {
    let canvaSize = 125;
    let snake;

    var intervalID = window.setInterval(myCallback, 10);

    p.setup = function () {
        p.createCanvas(canvaSize, canvaSize);
        snake = new SnakeGame(4, 4, p);
        snake.generateFood();
        snake.resize5TimesSmaller();
    }

    p.keyPressed = function () {
        if (p.keyCode === 82) {
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

    let ok = -1, oldPosx, oldPosy;

    function myCallback() {

        p.brain.snakeScore = snake.totalScore;
        p.brain.intervalID = intervalID;

        p.background(55);
        if (snake.gameOver) {
            p.brain.alive = false;
            snake.drawStatic();
            p.fill(255, 255, 255);
            if (snake.snakeSize == 25) {
                p.textSize(36);
                p.text(p.brain.id, 300, 300);
            } else {
                p.text(p.brain.id, 60, 60);
            }
            window.clearInterval(intervalID);
        } else {
            snake.drawDynamic();
            if (autoSnake) {
                snake.autoPlay();
            }
            p.fill(255, 255, 255);
            if (snake.snakeSize == 25) {
                p.textSize(36);
                p.text(p.brain.id, 300, 300);
            } else {
                p.text(p.brain.id, 60, 60);
            }
        }
        
        if (!autoSnake && !snake.gameOver) {
            if (ok == -1) {
                oldPosx = snake.headX;
                oldPosy = snake.headY;
                ok = 1;
            } else {
                let oldDif = Math.abs(oldPosx - snake.foodPos.x) + Math.abs(oldPosy - snake.foodPos.y);
                let newDif = Math.abs(snake.headX - snake.foodPos.x) + Math.abs(snake.headY - snake.foodPos.y);

                if (newDif < oldDif)
                    p.brain.score += 1;
                else
                    p.brain.score -= 3.5;

                oldPosx = snake.headX;
                oldPosy = snake.headY;
            }

            /* possibleHeadCollision:   output[0] -> left, output[1] -> straight, output[2] -> right
             * foodDirections:          output[3] -> left, output[4] -> straight, output[5] -> right */
            let input = snake.possibleHeadCollision();
            input = input.concat(snake.foodDirections());
            if (powerups) {
                input = input.concat(snake.powerupDirections());
                input = input.concat(snake.whichPowerup());
            }
            let dir = p.brain.predict(input);

             /* 0 -> left, 1 -> straight, 2 - > right */
            if (dir == 2) {
                if (snake.direction == direction.LEFT) {
                    snake.direction = direction.UP;
                } else {
                    snake.direction++;
                }
            } else if (dir == 0) {
                if (snake.direction == direction.UP) {
                    snake.direction = direction.LEFT;
                } else {
                    snake.direction--;
                }
            }

            if (!snakeIsLoading && p.brain.score < -400) {
                snake.gameOver = true;
                p.brain.score += snake.totalScore * 50; // parametru de modificat
            }
        }
    }
}
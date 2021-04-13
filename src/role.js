const Role = function() {}

Role.prototype = {
    init() {
        this.newGame();
    },

    update() {
        if (game.ui.state === "START") return;

        switch (game.table.getBallState()) {
            case "IDLE":
                if (!this.isNextTurn) {
                    this.isNextTurn = true;

                    const whiteBallInPocket = game.table.balls[0].ball.inPocket;
                    const blackBallInPocket = game.table.balls[8].ball.inPocket;
                    const allStraightInPocket = game.table.balls.slice(1, 8).every(ball => ball.ball.wasPocket || ball.ball.inPocket);
                    const allCrossInPocket = game.table.balls.slice(9).every(ball => ball.ball.wasPocket || ball.ball.inPocket);
                    const someStraightInPocket = game.table.balls.slice(1, 8).some(ball => ball.ball.inPocket);
                    const someCrossInPocket = game.table.balls.slice(9).some(ball => ball.ball.inPocket);

                    if (blackBallInPocket) {
                        const allBallInPocket =
                            this.type === undefined ? undefined :
                            this.type === true ? allStraightInPocket : allCrossInPocket;

                        if (this.type === undefined || whiteBallInPocket || !allBallInPocket) {
                            this.swapTurn();
                        }

                        game.ui.state = "OVER";
                    } else {
                        const someBallInPocket =
                            this.type === undefined ? undefined :
                            this.type === true ? someStraightInPocket : someCrossInPocket;

                        if (this.type !== undefined) {
                            if (whiteBallInPocket || !someBallInPocket) {
                                this.swapTurn();
                            }
                        } else {
                            if (someStraightInPocket && someCrossInPocket) {
                                if (whiteBallInPocket) {
                                    this.swapTurn();
                                }
                            } else if (!someStraightInPocket && !someCrossInPocket) {
                                this.swapTurn();
                            } else {
                                this.type = someStraightInPocket ? true : false;
                            }
                        }
                    }

                    this.displayTurn();
                }
                break;
            case "ROLLING":
                this.isNextTurn = false;
                break;
        }
    },

    newGame() {
        this.turn = false;
        this.isNextTurn = false;
        this.type = undefined;
    },

    displayTurn() {
        const player = this.turn ?
            game.ui.player1NameLabel.element.text :
            game.ui.player2NameLabel.element.text;
        game.ui.turnLabel.element.text = player + "'s turn";
        game.ui.ballTypeLabel.element.text =
            this.type === true ? "Straight Ball" :
            this.type === false ? "Cross Ball" :
            "";

        game.ui.turnMenu.enabled = true;
        setTimeout(() => {
            game.ui.turnMenu.enabled = false;
        }, 2000);
    },

    swapTurn() {
        this.turn = !this.turn;
        if (this.type !== undefined) {
            this.type = !this.type;
        }
    },
}
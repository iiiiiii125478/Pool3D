const Cue = function() {

}

Cue.prototype = {
    init() {
        const cueUrl = "../assets/models/cue.obj";
        game.app.assets.loadFromUrl(cueUrl, "model", (err, asset) => {
            this.cue = new pc.Entity();
            this.cue.addComponent("model");
            this.cue.model.model = asset.resource;
            game.app.root.addChild(this.cue);
            this.cue.setLocalScale(0.1, 0.1, 0.1);
            this.cue.setLocalEulerAngles(0, 90, 0);
        });

        this.newGame();
    },

    newGame() {
        this.state = "IDLE";
        this.impulse = 0;

        if (this.cue) {
            this.cue.setLocalScale(0.1, 0.1, 0.1);
            this.cue.setLocalEulerAngles(0, 90, 0);
            this.cue.enabled = true;
        }
    },

    update(dt) {
        switch (this.state) {
            case "AIM":
                if (game.table.getBallState() === "IDLE") {
                    this.impulse = pc.math.clamp(this.impulse += dt * 5, 0, 15);
                    if (this.impulse !== 15) {
                        this.cue.translateLocal(0, 0, -dt);
                    }
                }
                break;
            case "SHOOT":
                this.cue.translateLocal(0, 0, this.impulse / 5);
                this.impulse = 0;
                break;
            case "IDLE":
                break;
            default:
                throw "The state doesn't exist | update | Cue | cue.js";
        }

        if (this.impulse !== 0) {
            this.state = "AIM";
        } else if (game.table.getBallState() === "IDLE") {
            this.state = "IDLE";
        }
    },

    rotateY(angle) {
        if (this.cue === undefined) return;

        const whiteBallPosition = game.table.balls[0].ball.localPosition;
        this.cue.rotate(0, angle, 0);
        this.cue.setLocalPosition(
            whiteBallPosition.x,
            whiteBallPosition.y,
            whiteBallPosition.z,
        );
        this.cue.translateLocal(0, 0, -15 - 1);
    }
}
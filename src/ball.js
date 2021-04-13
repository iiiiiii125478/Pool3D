const Ball = function() {

}

Ball.prototype = {
    init(position, id) {
        const ball = game.getModel("sphere");
        ball.setLocalScale(1, 1, 1);

        ball.addComponent("rigidbody", {
            type: "dynamic",
            mass: BALL_MASS,
            restitution: BALL_RESTITUTION,
            friction: BALL_FRICTION,
            rollingFriction: BALL_ROLLING_FRICTION,
        });

        ball.addComponent("collision", {
            type: "sphere",
            radius: 0.5,
        });

        if (id !== 0) {
            game.app.assets.loadFromUrl("../assets/textures/ball_" + id + ".png", "texture", (err, asset) => {
                const material = new pc.StandardMaterial();
                material.diffuseMap = asset.resource;
                material.update();

                ball.model.meshInstances[0].material = material;
            });
        } else {
            game.app.assets.loadFromUrl("../scripts/ball/ball.js", "script", (err, asset) => {
                ball.addComponent("script");
                ball.script.create("whiteBall");
            });
        }

        this.ball = ball;
        this.ball.type =
            id > 0 && id < 8 ? "STRAIGHT" :
            id > 8 ? "CROSS" :
            "EXCEPT";
        this.newGame(position);
    },

    newGame(position) {
        this.ball.rigidbody.teleport(new pc.Vec3(position));
        this.ball.setLocalScale(1, 1, 1);

        this.ball.velocity = new pc.Vec3(0, 0, 0);
        this.ball.rigidbody.linearVelocity = pc.Vec3.ZERO;
        this.ball.rigidbody.angularVelocity = pc.Vec3.ZERO;

        this.ball.wasPocket = false;
        this.ball.inPocket = false;
        this.ball.state = undefined;
    },

    update(dt) {
        if (game.table.getBallState() === "IDLE" && this.ball.inPocket === true) {
            this.ball.wasPocket = true;
            this.ball.inPocket = false;
        }

        this.setupImpulse();
        this.setupInPocket();
        this.setupState();
    },

    setupImpulse() {
        this.ball.rigidbody.applyImpulse(this.ball.velocity);
        this.ball.velocity.mulScalar(0);
    },

    setupInPocket() {
        if (!this.ball.wasPocket) {
            this.ball.inPocket = this.ball.getLocalPosition().y < -1; // Under table
        }
    },

    setupState() {
        const linearVelocity = this.ball.rigidbody.linearVelocity.clone();
        const angularVelocity = this.ball.rigidbody.angularVelocity.clone();

        this.ball.state = this.ball.state === "RESET_WHITE_BALL" ? "RESET_WHITE_BALL" :
            this.ball.inPocket || this.ball.wasPocket || (
                linearVelocity.length() < EPS &&
                angularVelocity.length() < EPS
            ) ?
            "IDLE" :
            "ROLLING";
    },
}
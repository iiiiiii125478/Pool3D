const Table = function() {
    this.ball_state = "IDLE"; // IDLE, ROLLING, RESET_WHITE_BALL
    this.cue_state = "IDLE"; // IDLE, AIM, SHOOT
}

Table.prototype = {
    init() {
        // Table
        this.table = game.getModel("box");
        this.table.setLocalPosition(0, -1, 0);
        this.table.setLocalScale(40, 1, 20);

        this.table.addComponent("rigidbody", {
            type: "static",
            friction: 0.3,
            rollingFriction: 0.4,
        });
        this.table.addComponent("collision", {
            type: "box",
            halfExtents: new pc.Vec3(20, 0.5, 10),
        });

        var material = new pc.StandardMaterial();
        material.diffuse = new pc.Color(0.1, 0.8, 0.2);
        material.update();
        this.table.model.meshInstances[0].material = material;

        // Wall
        this.initWall(new pc.Vec3([20.5, 0, 0]), new pc.Vec3([90, 0, 90]), new pc.Vec3([1, 18, 1]));
        this.initWall(new pc.Vec3([-20.5, 0, 0]), new pc.Vec3([90, 0, 90]), new pc.Vec3([1, 18, 1]));
        this.initWall(new pc.Vec3([-10, 0, -10.5]), new pc.Vec3([0, 0, 90]), new pc.Vec3([1, 18, 1]));
        this.initWall(new pc.Vec3([10, 0, -10.5]), new pc.Vec3([0, 0, 90]), new pc.Vec3([1, 18, 1]));
        this.initWall(new pc.Vec3([-10, 0, 10.5]), new pc.Vec3([0, 0, 90]), new pc.Vec3([1, 18, 1]));
        this.initWall(new pc.Vec3([10, 0, 10.5]), new pc.Vec3([0, 0, 90]), new pc.Vec3([1, 18, 1]));

        // Balls
        this.balls = [];
        BALLS_POSITION.forEach((position, idx) => {
            const ball = new Ball();
            ball.init(position, idx);
            this.balls.push(ball);
        });

        // Cue
        this.cue = new Cue();
        this.cue.init();

        this.newGame();
    },

    newGame() {
        this.balls.forEach((ball, pos) => {
            ball.newGame(BALLS_POSITION[pos]);
        });
        this.cue.newGame();
    },

    initWall(position, rotate, scale) {
        const wall = game.getModel("box");
        wall.setLocalEulerAngles(rotate);
        wall.setLocalPosition(position);
        wall.setLocalScale(scale)
        wall.addComponent("rigidbody", {
            type: "static",
            restitution: 0.5,
            friction: 0.3,
            rollingFriction: 0.4,
        });
        wall.addComponent("collision", {
            type: "box",
            halfExtents: scale.divScalar(2),
        });
        return wall;
    },

    update(dt) {
        this.balls.forEach(ball => {
            ball.update(dt);
        });

        this.cue.update(dt);

        this.ball_state =
            this.balls[0].ball.state === "RESET_WHITE_BALL" ? "RESET_WHITE_BALL" :
            this.balls.some((ball) => ball.ball.state === "ROLLING") ? "ROLLING" :
            "IDLE";
    },

    getBallState() {
        return this.ball_state;
    },

    getCueState() {
        return this.cue.state;
    },

    setCueState(state) {
        return this.cue.state = state;
    },
}
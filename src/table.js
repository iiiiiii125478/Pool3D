const Table = function() {
    this.ball_state = "IDLE"; // IDLE, ROLLING, RESET_WHITE_BALL
    this.cue_state = "IDLE"; // IDLE, AIM, SHOOT
}

Table.prototype = {
    init() {
        this.setupTable();
        this.setupWalls();
        this.setupBalls();

        this.cue = new Cue();
        this.cue.init();

        this.newGame();
    },

    setupTable() {
        this.table = game.getModel("box");
        this.table.setLocalPosition(0, -TABLE_DEPTH, 0);
        this.table.setLocalScale(TABLE_WIDTH, TABLE_DEPTH, TABLE_HEIGHT);

        this.table.addComponent("rigidbody", {
            type: "static",
            friction: TABLE_FRICTION,
            rollingFriction: TABLE_ROLLING_FRICTION,
        });
        this.table.addComponent("collision", {
            type: "box",
            halfExtents: new pc.Vec3(TABLE_WIDTH / 2, TABLE_DEPTH / 2, TABLE_HEIGHT / 2),
        });

        var material = new pc.StandardMaterial();
        material.diffuse = new pc.Color(TABLE_COLOR);
        material.update();
        this.table.model.meshInstances[0].material = material;
    },

    setupWalls() {
        WALL_POSITION.forEach((position, idx) => {
            const rotate = WALL_ROTATE[idx];
            const scale = WALL_SCALE[idx];
            this.initWall(
                new pc.Vec3(position),
                new pc.Vec3(rotate),
                new pc.Vec3(scale),
            );
        });
    },

    setupBalls() {
        this.balls = [];
        BALLS_POSITION.forEach((position, idx) => {
            const ball = new Ball();
            ball.init(position, idx);
            this.balls.push(ball);
        });
    },

    newGame() {
        this.balls.forEach((ball, idx) => {
            ball.newGame(BALLS_POSITION[idx]);
        });
        this.cue.newGame();
    },

    initWall(position, rotate, scale) {
        const wall = game.getModel("box");
        wall.setLocalEulerAngles(rotate);
        wall.setLocalPosition(position);
        wall.setLocalScale(scale);
        wall.addComponent("rigidbody", {
            type: "static",
            restitution: WALL_RESTITUTION,
            friction: WALL_FRICTION,
            rollingFriction: WALL_ROLLING_FRICTION,
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
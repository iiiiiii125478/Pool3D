const Game = function() {

}

Game.prototype = {
    init() {
        this.setupApplication(pc.FILLMODE_FILL_WINDOW, pc.RESOLUTION_AUTO);
        this.getMiniStatistics();

        this.app.loader.getHandler("model").addParser(new ObjModelParser(this.app.graphicDevices), (url, data) => {
            return pc.path.getExtension(url) === ".obj";
        });

        // Light
        this.light = new Light();
        this.light.init(game.app);

        this.table = new Table();
        this.table.init();

        this.camera = new Camera();
        this.camera.init();

        this.ui = new UI();
        this.ui.init();

        this.role = new Role();
        this.role.init();

        this.newGame();
    },

    newGame() {
        this.camera.newGame();
        this.role.newGame();
        this.table.newGame();
    },

    loadAmmoLibrary() {
        if (wasmSupported()) {
            loadWasmModuleAsync('Ammo', '../lib/ammo/ammo.wasm.js', '../lib/ammo/ammo.wasm.wasm', this.init.bind(this), this.gameLoop.bind(this));
        } else {
            loadWasmModuleAsync('Ammo', '../lib/ammo/ammo.js', '', this.init.bind(this), this.gameLoop.bind(this));
        }
    },

    setupApplication(fillMode, resolution) {
        const canvas = document.getElementById("application-canvas");
        const app = new pc.Application(canvas, {
            keyboard: new pc.Keyboard(document.body),
            mouse: new pc.Mouse(document.body),
            elementInput: new pc.ElementInput(canvas),
        });
        app.start();

        app.setCanvasFillMode(fillMode);
        app.setCanvasResolution(resolution);

        window.addEventListener("resize", () => {
            app.resizeCanvas(canvas.width, canvas.height);
        });

        app.systems.rigidbody.gravity.set(0, -9.81, 0);

        this.app = app;
        this.canvas = canvas;
    },

    getMiniStatistics() {
        return new pcx.MiniStats(this.app);
    },

    getCamera() {
        const camera = new pc.Entity();
        camera.addComponent("camera", {
            clearColor: new pc.Color(0.4, 0.6, 1),
        });

        this.app.root.addChild(camera);
        return camera;
    },

    getModel(type) {
        const model = new pc.Entity();
        model.addComponent("model", {
            type: type,
        });

        this.app.root.addChild(model);
        return model;
    },

    getModelObj(asset) {
        const model = new pc.Entity();
        model.addComponent("model");
        model.model.model = asset.resource;

        this.app.root.addChild(model);
        return model;
    },

    // loadTexture(url, modelType) {
    //     const model = this.getModel(modelType);

    //     this.app.assets.loadFromUrl(url, "texture", (err, asset) => {
    //         const material = new pc.StandardMaterial();
    //         material.diffuseMap = asset.resource;
    //         material.update();

    //         model.model.material = material;
    //     });

    //     return model;
    // },

    setupPredictDirection() {
        if (this.table.cue.cue === undefined) return;

        const cuePos = this.table.cue.cue.getLocalPosition();
        const ballPos = this.table.balls[0].ball.getLocalPosition();
        const direction = ballPos.clone().sub(cuePos.clone()).normalize();

        const start = direction.clone().mulScalar(0.5).add(ballPos);
        const end = direction.clone().mulScalar(40).add(ballPos);

        const result = this.app.systems.rigidbody.raycastFirst(start, end);
        if (result) {
            this.app.renderLine(start, result.point, pc.Color.BLACK);

            const cross = new pc.Vec3().cross(result.normal, pc.Vec3.UP).normalize();

            if (cross.clone().dot(direction) < 0) {
                cross.mulScalar(-1);
            }

            cross.add(result.point);
            this.app.renderLine(cross, result.point, pc.Color.BLACK);
        }
    },

    moveCameraLock(dx, dy) {
        const camera = this.camera.targetCamera;
        if (!camera.y) camera.y = 0;

        const ex = dx * TARGET_CAMERA_VERTICAL_SPEED;
        camera.y += dy * TARGET_CAMERA_HORIZONTAL_SPEED;
        camera.rotate(0, -ex, 0);

        const origin = this.table.balls[0].ball.localPosition;
        camera.setLocalPosition(origin.x, origin.y, origin.z);

        camera.y = pc.math.clamp(camera.y, 0, 20);
        camera.translateLocal(0, 0, 7 + camera.y);
    },

    shoot() {
        const cue = this.table.cue;
        const whiteBall = this.table.balls[0];

        const p1 = cue.cue.getLocalPosition();
        const p2 = whiteBall.ball.getLocalPosition();
        const dir = p2.clone().sub(p1).normalize();

        whiteBall.ball.velocity.x = dir.x * cue.impulse * 200;
        whiteBall.ball.velocity.y = dir.y * cue.impulse * 200;
        whiteBall.ball.velocity.z = dir.z * cue.impulse * 200;
    },

    getState() {
        return this.ui.state;
    },

    setState(state) {
        this.ui.state = state;
    },

    mouseHandle() {
        return {
            PLAY: {
                down: (event) => {
                    this.mouseEvent = event;
                    this.mousePressed = true;

                    switch (this.table.getBallState()) {
                        case "RESET_WHITE_BALL":
                            const camera = this.camera.lookDownCamera;
                            const from = camera.camera.screenToWorld(event.x, event.y, camera.camera.nearClip);
                            const to = camera.camera.screenToWorld(event.x, event.y, camera.camera.farClip);

                            const result = this.app.systems.rigidbody.raycastFirst(from, to);
                            if (result && result.entity === this.table.balls[0].ball) {
                                this.moveWhiteBall = true;
                                game.table.balls.slice(1).forEach(ball => {
                                    ball.ball.rigidbody.type = "static";
                                });
                            }
                            break;
                        default:
                            if (event.button === 0) {
                                this.app.mouse.enablePointerLock();
                            }
                    }
                },
                move: (event) => {
                    this.mouseEvent = event;

                    if (!pc.Mouse.isPointerLocked() ||
                        this.table.getBallState() !== "IDLE"
                    ) return;

                    if (this.table.getCueState() !== "SHOOT") {
                        this.table.cue.impulse = 0;
                        this.table.cue.rotateY(-event.dx * TARGET_CAMERA_VERTICAL_SPEED);
                    }
                    this.moveCameraLock(event.dx, event.dy);

                    // switch (this.camera.state) {
                    //     case "FLY":
                    //         if (!pc.Mouse.isPointerLocked()) return;

                    //         const camera = this.camera.flyCamera;
                    //         camera.ex -= event.dy * 0.1;
                    //         camera.ex = pc.math.clamp(camera.ex, -90, 10);
                    //         camera.ey -= event.dx * 0.1;
                    //         camera.setLocalEulerAngles(camera.ex, camera.ey, 0);
                    //         break;
                    //     case "TARGET":
                    //         if (!pc.Mouse.isPointerLocked() ||
                    //             this.table.getBallState() !== "IDLE"
                    //         ) return;

                    //         if (this.table.getCueState() !== "SHOOT") {
                    //             this.table.cue.impulse = 0;
                    //             this.table.cue.rotateY(-event.dx * TARGET_CAMERA_VERTICAL_SPEED);
                    //         }

                    //         this.moveCameraLock(event.dx, event.dy);
                    //         break;
                    // }
                },
                up: (event) => {
                    this.mouseEvent = event;
                    this.mousePressed = false;
                    switch (this.table.getBallState()) {
                        case "RESET_WHITE_BALL":
                            this.moveWhiteBall = false;
                            break;
                    }

                    if (event.button === 0) {
                        if (pc.Mouse.isPointerLocked()) {
                            this.app.mouse.disablePointerLock();
                        }
                    }
                },
            },
            START: {
                down: (event) => {},
                move: (event) => {},
                up: (event) => {},
            },
            PAUSE: {
                down: (event) => {},
                move: (event) => {},
                up: (event) => {},
            },
            OVER: {
                down: (event) => {},
                move: (event) => {},
                up: (event) => {},
            },
        }
    },

    keyboardHandle() {
        return {
            PLAY: (dt) => {
                if (this.app.keyboard.isPressed(pc.KEY_SPACE)) {
                    this.table.setCueState("AIM");
                } else {
                    if (this.table.cue.impulse !== 0) {
                        this.table.setCueState("SHOOT");
                        this.shoot();
                    }
                }
                // switch (this.camera.state) {
                //     case "FLY":
                //         let speed = CAMERA_SPEED;
                //         if (this.app.keyboard.isPressed(pc.KEY_SHIFT)) {
                //             speed = CAMERA_FAST_SPEED;
                //         }

                //         const camera = this.camera.flyCamera;
                //         if (this.app.keyboard.isPressed(pc.KEY_W)) {
                //             camera.translateLocal(0, 0, -speed * dt);
                //         } else if (this.app.keyboard.isPressed(pc.KEY_S)) {
                //             camera.translateLocal(0, 0, speed * dt);
                //         }

                //         if (this.app.keyboard.isPressed(pc.KEY_A)) {
                //             camera.translateLocal(-speed * dt, 0, 0);
                //         } else if (this.app.keyboard.isPressed(pc.KEY_D)) {
                //             camera.translateLocal(speed * dt, 0, 0);
                //         }
                //         break;
                //     case "TARGET":
                //         if (this.app.keyboard.isPressed(pc.KEY_SPACE)) {
                //             this.table.setCueState("AIM");
                //         } else {
                //             if (this.table.cue.impulse !== 0) {
                //                 this.table.setCueState("SHOOT");
                //                 this.shoot();
                //             }
                //         }
                //         break;
                // }

                if (this.app.keyboard.wasPressed(pc.KEY_V)) {
                    if (this.camera.getCurrentState() === "FLY_THROUGH") return;

                    if (this.table.getBallState() === "RESET_WHITE_BALL") {
                        this.table.balls.slice(1).forEach(ball => {
                            ball.ball.rigidbody.type = "dynamic";
                        });

                        this.table.cue.cue.enabled = true;
                        this.table.balls[0].ball.state = "IDLE";
                    } else {
                        this.camera.setupSlidePath(
                            this.camera.getCurrentCamera(),
                            this.camera.getAnotherCamera(),
                        );
                    }
                }

                if (this.app.keyboard.wasPressed(pc.KEY_P)) {
                    this.setState("PAUSE");
                }
            },
            START: (dt) => {

            },
            PAUSE: (dt) => {

            },
            OVER: (dt) => {

            },
        }
    },

    mousePressedHandle(event) {
        if (this.mousePressed && this.moveWhiteBall) {
            const whiteBall = this.table.balls[0].ball;
            const camera = this.camera.lookDownCamera;

            const from = camera.camera.screenToWorld(event.x, event.y, camera.camera.nearClip);
            const to = camera.camera.screenToWorld(event.x, event.y, camera.camera.farClip);
            whiteBall.rigidbody.enabled = false;
            const result = this.app.systems.rigidbody.raycastFirst(from, to);
            whiteBall.rigidbody.enabled = true;

            if (result) {
                whiteBall.rigidbody.teleport(new pc.Vec3([
                    pc.math.clamp(result.point.x, -19.5, 19.5),
                    0,
                    pc.math.clamp(result.point.z, -9.5, 9.5),
                ]));
            }
        }
    },

    gameLoop() {
        const mouseHandle = this.mouseHandle();
        const keyboardHandle = this.keyboardHandle();

        {
            this.app.mouse.on(pc.EVENT_MOUSEDOWN, (event) => {
                mouseHandle[this.getState()].down(event);
            });

            this.app.mouse.on(pc.EVENT_MOUSEMOVE, (event) => {
                mouseHandle[this.getState()].move(event);
            });

            this.app.mouse.on(pc.EVENT_MOUSEUP, (event) => {
                mouseHandle[this.getState()].up(event);
            });
        }

        this.app.on("update", (dt) => {
            keyboardHandle[this.getState()](dt);
            this.mousePressedHandle(this.mouseEvent);

            this.table.update(dt);
            this.ui.update(dt);
            this.role.update(dt);

            if (this.table.getBallState() === "IDLE") {
                this.setupPredictDirection();

                if (this.table.getCueState() === "IDLE") {
                    this.table.cue.rotateY(0);
                    this.moveCameraLock(0, 0);
                }
            }

            this.camera.update(dt);
        });
    },
}

const game = new Game();
game.loadAmmoLibrary();
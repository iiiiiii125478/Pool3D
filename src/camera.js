const Camera = function() {

}

Camera.prototype = {
    init() {
        this.flyCamera = game.getCamera();
        this.targetCamera = game.getCamera();
        this.lookDownCamera = game.getCamera();
        this.flyingThroughCamera = game.getCamera();
    },

    newGame() {
        this.setFlyCamera();
        this.setTargetCamera();
        this.setLookDownCamera();

        this.setState("LOOK_DOWN"); // TARGET, FLY_THROUGH, LOOK_DOWN
    },

    setFlyCamera() {
        const position = new pc.Vec3([-20, 10, 0]);
        this.flyCamera.setLocalPosition(position);
        this.flyCamera.lookAt(0, 0, 0);
    },

    setTargetCamera() {
        const position = new pc.Vec3([
            game.table.balls[0].ball.localPosition.x - 7,
            game.table.balls[0].ball.localPosition.y + 3,
            game.table.balls[0].ball.localPosition.z,
        ]);
        this.targetCamera.setLocalPosition(position);
        this.targetCamera.lookAt(game.table.balls[0].ball.localPosition);
    },

    setLookDownCamera() {
        const position = new pc.Vec3([0, 31, 0]);
        this.lookDownCamera.setLocalPosition(position);
        this.lookDownCamera.setLocalEulerAngles(-90, 0, 0);
    },

    setState(state) {
        this.setCamera(this.getCamera(state));
    },

    getState(camera) {
        return (
            camera === this.flyCamera ? "FLY" :
            camera === this.targetCamera ? "TARGET" :
            camera === this.lookDownCamera ? "LOOK_DOWN" :
            camera === this.flyingThroughCamera ? "FLY_THROUGH" :
            undefined
        );
    },

    getCurrentState() {
        return this.state;
    },

    setCamera(camera) {
        this.state = this.getState(camera);
        if (!this.state) {
            throw "Unknown Camera | setCamera | camera.js"
        }

        this.resetPriority();
        camera.camera.priority = -camera.camera.priority;
    },

    getCamera(state) {
        return (
            state === "FLY" ? this.flyCamera :
            state === "TARGET" ? this.targetCamera :
            state === "LOOK_DOWN" ? this.lookDownCamera :
            state === "FLY_THROUGH" ? this.flyingThroughCamera :
            undefined
        );
    },

    getCurrentCamera() {
        return this.getCamera(this.state);
    },

    getAnotherCamera() {
        const state =
            this.state === "LOOK_DOWN" ? "TARGET" :
            this.state === "TARGET" ? "LOOK_DOWN" :
            undefined;
        return this.getCamera(state);
    },

    resetPriority() {
        this.flyCamera.camera.priority = 0;
        this.targetCamera.camera.priority = -1;
        this.flyingThroughCamera.camera.priority = -2;
        this.lookDownCamera.camera.priority = -3;
    },

    setupSlidePath(begin, target) {
        const curveMode = pc.CURVE_SMOOTHSTEP;

        this.px = new pc.Curve();
        this.px.type = curveMode;
        this.py = new pc.Curve();
        this.py.type = curveMode;
        this.pz = new pc.Curve();
        this.pz.type = curveMode;

        this.tx = new pc.Curve();
        this.tx.type = curveMode;
        this.ty = new pc.Curve();
        this.ty.type = curveMode;
        this.tz = new pc.Curve();
        this.tz.type = curveMode;

        this.ux = new pc.Curve();
        this.ux.type = curveMode;
        this.uy = new pc.Curve();
        this.uy.type = curveMode;
        this.uz = new pc.Curve();
        this.uz.type = curveMode;

        const nodes = [begin, target];
        this.nodes = nodes;

        const nodePathLength = [];
        const distanceBetween = new pc.Vec3();

        let pathLength = 0;
        nodePathLength.push(pathLength);

        for (i = 1; i < nodes.length; i++) {
            const prevNode = nodes[i - 1];
            const nextNode = nodes[i];

            distanceBetween.sub2(prevNode.getPosition(), nextNode.getPosition());
            pathLength += distanceBetween.length();

            nodePathLength.push(pathLength);
        }

        for (i = 0; i < nodes.length; i++) {
            const t = nodePathLength[i] / pathLength;

            const node = nodes[i];

            const pos = node.getPosition();
            this.px.add(t, pos.x);
            this.py.add(t, pos.y);
            this.pz.add(t, pos.z);

            const lookAt = pos.clone().add(node.forward);
            this.tx.add(t, lookAt.x);
            this.ty.add(t, lookAt.y);
            this.tz.add(t, lookAt.z);

            const up = node.up;
            this.ux.add(t, up.x);
            this.uy.add(t, up.y);
            this.uz.add(t, up.z);
        }

        this.duration = 1;
        this.time = 0;
        this.lookAt = new pc.Vec3();
        this.up = new pc.Vec3();
        this.setState("FLY_THROUGH");
    },

    update(dt) {
        switch (this.state) {
            case "FLY_THROUGH":
                this.time += dt;

                if (this.time > this.duration) {
                    this.setCamera(this.nodes[1]);
                    return;
                }

                const percent = this.time / this.duration;
                this.flyingThroughCamera.setPosition(this.px.value(percent), this.py.value(percent), this.pz.value(percent));
                this.lookAt.set(this.tx.value(percent), this.ty.value(percent), this.tz.value(percent));
                this.up.set(this.ux.value(percent), this.uy.value(percent), this.uz.value(percent));
                this.flyingThroughCamera.lookAt(this.lookAt, this.up);
                break;
        }
    },
}
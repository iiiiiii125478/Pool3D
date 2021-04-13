const WhiteBall = pc.createScript("whiteBall");

WhiteBall.prototype.initialize = function() {

}

WhiteBall.prototype.update = function(dt) {
    this._setupBallInPocket();
}

WhiteBall.prototype._setupBallInPocket = function() {
    this.entity.wasPocket = false;
    if (game.table.getBallState() === "IDLE" && this.entity.inPocket) {
        const position = new pc.Vec3(-8, 2, 0);

        this.entity.rigidbody.teleport(position);
        this.entity.rigidbody.linearVelocity = pc.Vec3.ZERO;
        this.entity.rigidbody.angularVelocity = pc.Vec3.ZERO;

        this.entity.state = "RESET_WHITE_BALL";
        game.camera.setupSlidePath(
            game.camera.getCurrentCamera(),
            game.camera.lookDownCamera,
        );
        game.table.cue.cue.enabled = false;
    }
}
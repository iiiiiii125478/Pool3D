const Light = function() {

}

Light.prototype = {
    init(app) {
        this.setupAmbientLight(app);
        this.setupPointLight(app);
    },

    setupAmbientLight(app) {
        app.scene.ambientLight = new pc.Color(AMBIENT_LIGHT_COLOR);
    },

    setupPointLight(app) {
        POINT_LIGHT_POSITION.forEach(position => {
            const light = this.getPointLight();
            light.setLocalPosition(new pc.Vec3(position));
            app.root.addChild(light);
        });
    },

    getPointLight() {
        const light = new pc.Entity();
        light.addComponent("light", {
            type: "omni",
            range: POINT_LIGHT_RANGE,
            castShadows: true,
        });
        return light;
    },
}
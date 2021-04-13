const UI = function() {
    this.state = "START"; // PLAY, PAUSE
}

UI.prototype = {
    init() {
        this.startScreen();
        this.pauseScreen();
        this.playScreen();
        this.overScreen();
        this.turnScrren();

        this.loadAsset();
        this.handleKeyboard();

        this.newGame();
    },

    newGame() {
        this.updateScore(0, 0);
    },

    updateScore(p1s, p2s) {
        if (p1s || p1s === 0) this.player1Score = p1s;
        if (p2s || p2s === 0) this.player2Score = p2s;

        this.player1ScoreLabel.element.text = this.player1Score
        this.player2ScoreLabel.element.text = this.player2Score;
    },

    update(dt) {
        this.startMenu.enabled = this.state === "START";
        this.pauseMenu.enabled = this.state === "PAUSE";
        this.playMenu.enabled = this.state === "PLAY";
        this.overMenu.enabled = this.state === "OVER";
    },

    startScreen() {
        const startMenu = new pc.Entity();

        startMenu.addComponent("screen", {
            referenceResolution: new pc.Vec2(1280, 720),
            scaleBlend: 0.5,
            scaleMode: pc.SCALEMODE_BLEND,
            screenSpace: true
        });
        game.app.root.addChild(startMenu);

        const playButton = new pc.Entity();
        playButton.addComponent("button", {
            imageEntity: playButton
        });
        playButton.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            height: 80,
            pivot: [0.5, 0.5],
            type: pc.ELEMENTTYPE_IMAGE,
            width: 350,
            useInput: true
        });
        game.app.assets.loadFromUrl("../assets/textures/triangle.png", "texture", (err, asset) => {
            const material = new pc.StandardMaterial();
            material.diffuseMap = asset.resource;
            material.update();

            // playButton.element.material = material;
            // playButton.meshInstances[0].material = material;
        });
        startMenu.addChild(playButton);

        const playLabel = new pc.Entity();
        playLabel.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            color: new pc.Color(0, 0, 0),
            fontSize: 64,
            height: 128,
            pivot: [0.5, 0.5],
            text: "PLAY",
            type: pc.ELEMENTTYPE_TEXT,
            width: 256,
            wrapLines: true
        });
        playButton.addChild(playLabel);

        this.startMenu = startMenu;
        this.playButton = playButton;
        this.playLabel = playLabel;
    },

    pauseScreen() {
        const pauseMenu = new pc.Entity();
        pauseMenu.addComponent("screen", {
            referenceResolution: new pc.Vec2(1280, 720),
            scaleBlend: 0.5,
            scaleMode: pc.SCALEMODE_BLEND,
            screenSpace: true
        });
        game.app.root.addChild(pauseMenu);

        const continueButton = new pc.Entity();
        continueButton.addComponent("button", {
            imageEntity: continueButton
        });
        continueButton.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            height: 80,
            pivot: [0.5, 0],
            type: pc.ELEMENTTYPE_IMAGE,
            width: 350,
            useInput: true
        });
        pauseMenu.addChild(continueButton);

        const continueLabel = new pc.Entity();
        continueLabel.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            color: new pc.Color(0, 0, 0),
            fontSize: 64,
            height: 128,
            pivot: [0.5, 0.5],
            text: "CONTINUE",
            type: pc.ELEMENTTYPE_TEXT,
            width: 256,
            wrapLines: true
        });
        continueButton.addChild(continueLabel);

        const restartButton = new pc.Entity();
        restartButton.addComponent("button", {
            imageEntity: restartButton,
        });
        restartButton.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            height: 80,
            pivot: [0.5, 1.5],
            type: pc.ELEMENTTYPE_IMAGE,
            width: 350,
            useInput: true
        });
        pauseMenu.addChild(restartButton);

        const restartLabel = new pc.Entity();
        restartLabel.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            color: new pc.Color(0, 0, 0),
            fontSize: 64,
            height: 128,
            pivot: [0.5, 0.5],
            text: "RESTART",
            type: pc.ELEMENTTYPE_TEXT,
            width: 256,
            wrapLines: true
        });
        restartButton.addChild(restartLabel);

        this.pauseMenu = pauseMenu;
        this.continueButton = continueButton;
        this.continueLabel = continueLabel;
        this.restartButton = restartButton;
        this.restartLabel = restartLabel;
    },

    playScreen() {
        const playMenu = new pc.Entity();

        playMenu.addComponent("screen", {
            referenceResolution: new pc.Vec2(1280, 720),
            scaleBlend: 0.5,
            scaleMode: pc.SCALEMODE_BLEND,
            screenSpace: true
        });
        game.app.root.addChild(playMenu);

        const player1Button = new pc.Entity();
        player1Button.addComponent("button", {
            imageEntity: player1Button
        });
        player1Button.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            height: 80,
            pivot: [0.5, 0.5],
            type: pc.ELEMENTTYPE_IMAGE,
            width: 350,
            useInput: true
        });
        player1Button.setLocalPosition(
            (game.canvas.clientWidth - 350) / -2,
            (game.canvas.clientHeight - 80) / 2,
            0
        );
        playMenu.addChild(player1Button);

        const player1NameLabel = new pc.Entity();
        player1NameLabel.addComponent("element", {
            anchor: [0, 0.5, 0.7, 0.5],
            color: new pc.Color(0, 0, 0),
            fontSize: 48,
            height: 128,
            pivot: [0.5, 0.5],
            text: "NGUYEN",
            type: pc.ELEMENTTYPE_TEXT,
            width: 256,
            wrapLines: true
        });
        player1Button.addChild(player1NameLabel);

        const player1ScoreLabel = new pc.Entity();
        player1ScoreLabel.addComponent("element", {
            anchor: [0.7, 0.5, 0.9, 0.5],
            color: new pc.Color(0, 0, 0),
            fontSize: 48,
            height: 128,
            pivot: [0.5, 0.5],
            text: "0",
            type: pc.ELEMENTTYPE_TEXT,
            width: 256,
            wrapLines: true
        });
        player1Button.addChild(player1ScoreLabel);

        const player2Button = new pc.Entity();
        player2Button.addComponent("button", {
            imageEntity: player2Button
        });
        player2Button.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            height: 80,
            pivot: [0.5, 0.5],
            type: pc.ELEMENTTYPE_IMAGE,
            width: 350,
            useInput: true
        });
        player2Button.setLocalPosition(
            (game.canvas.width - 350) / 2,
            (game.canvas.height - 80) / 2,
            0
        );
        playMenu.addChild(player2Button);

        const player2NameLabel = new pc.Entity();
        player2NameLabel.addComponent("element", {
            anchor: [0.2, 0.5, 0.9, 0.5],
            color: new pc.Color(0, 0, 0),
            fontSize: 48,
            height: 128,
            pivot: [0.5, 0.5],
            text: "DAT",
            type: pc.ELEMENTTYPE_TEXT,
            width: 256,
            wrapLines: true
        });
        player2Button.addChild(player2NameLabel);

        const player2ScoreLabel = new pc.Entity();
        player2ScoreLabel.addComponent("element", {
            anchor: [0, 0.5, 0.2, 0.5],
            color: new pc.Color(0, 0, 0),
            fontSize: 48,
            height: 128,
            pivot: [0.5, 0.5],
            text: "0",
            type: pc.ELEMENTTYPE_TEXT,
            width: 256,
            wrapLines: true
        });
        player2Button.addChild(player2ScoreLabel);

        this.playMenu = playMenu;
        this.player1NameLabel = player1NameLabel;
        this.player2NameLabel = player2NameLabel;
        this.player1ScoreLabel = player1ScoreLabel;
        this.player2ScoreLabel = player2ScoreLabel;
    },

    overScreen() {
        const overMenu = new pc.Entity();
        overMenu.addComponent("screen", {
            referenceResolution: new pc.Vec2(1280, 720),
            scaleBlend: 0.5,
            scaleMode: pc.SCALEMODE_BLEND,
            screenSpace: true
        });
        game.app.root.addChild(overMenu);

        const backMenuButton = new pc.Entity();
        backMenuButton.addComponent("button", {
            imageEntity: backMenuButton
        });
        backMenuButton.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            height: 80,
            pivot: [0.5, 0],
            type: pc.ELEMENTTYPE_IMAGE,
            width: 350,
            useInput: true
        });
        overMenu.addChild(backMenuButton);

        const backMenuLabel = new pc.Entity();
        backMenuLabel.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            color: new pc.Color(0, 0, 0),
            fontSize: 64,
            height: 128,
            pivot: [0.5, 0.5],
            text: "BACK MENU",
            type: pc.ELEMENTTYPE_TEXT,
            width: 256,
            wrapLines: true
        });
        backMenuButton.addChild(backMenuLabel);

        const anotherMatchButton = new pc.Entity();
        anotherMatchButton.addComponent("button", {
            imageEntity: anotherMatchButton,
        });
        anotherMatchButton.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            height: 80,
            pivot: [0.5, 1.5],
            type: pc.ELEMENTTYPE_IMAGE,
            width: 350,
            useInput: true
        });
        overMenu.addChild(anotherMatchButton);

        const anotherMatchLabel = new pc.Entity();
        anotherMatchLabel.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            color: new pc.Color(0, 0, 0),
            fontSize: 64,
            height: 128,
            pivot: [0.5, 0.5],
            text: "CONTINUE",
            type: pc.ELEMENTTYPE_TEXT,
            width: 256,
            wrapLines: true
        });
        anotherMatchButton.addChild(anotherMatchLabel);

        this.overMenu = overMenu;
        this.backMenuButton = backMenuButton;
        this.backMenuLabel = backMenuLabel;
        this.anotherMatchButton = anotherMatchButton;
        this.anotherMatchLabel = anotherMatchLabel;
    },

    turnScrren() {
        const turnMenu = new pc.Entity();
        turnMenu.addComponent("screen", {
            referenceResolution: new pc.Vec2(1280, 720),
            scaleBlend: 0.5,
            scaleMode: pc.SCALEMODE_BLEND,
            screenSpace: true,
        });
        game.app.root.addChild(turnMenu);

        const turnLabel = new pc.Entity();
        turnLabel.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 0],
            width: 256,
            height: 128,
            fontSize: 64,
            color: new pc.Color(0, 0, 0),
            text: "TODO",
            type: pc.ELEMENTTYPE_TEXT,
            wrapLines: true,
        });
        turnMenu.addChild(turnLabel);

        const ballTypeLabel = new pc.Entity();
        ballTypeLabel.addComponent("element", {
            anchor: [0.5, 0.5, 0.5, 0.5],
            pivot: [0.5, 1],
            width: 256,
            height: 128,
            fontSize: 32,
            color: new pc.Color(0, 0, 0),
            text: "TODO",
            type: pc.ELEMENTTYPE_TEXT,
            wrapLines: true,
        });
        turnMenu.addChild(ballTypeLabel);

        this.turnMenu = turnMenu;
        this.turnLabel = turnLabel;
        this.ballTypeLabel = ballTypeLabel;

        this.turnMenu.enabled = false;
    },

    loadAsset() {
        const self = this;

        const fontAsset = new pc.Asset('courier.json', "font", {
            url: "../assets/fonts/courier.json"
        });
        fontAsset.on('load', function() {
            self.playLabel.element.fontAsset = fontAsset;
            self.continueLabel.element.fontAsset = fontAsset;
            self.restartLabel.element.fontAsset = fontAsset;
            self.player1NameLabel.element.fontAsset = fontAsset;
            self.player2NameLabel.element.fontAsset = fontAsset;
            self.player1ScoreLabel.element.fontAsset = fontAsset;
            self.player2ScoreLabel.element.fontAsset = fontAsset;
            self.backMenuLabel.element.fontAsset = fontAsset;
            self.anotherMatchLabel.element.fontAsset = fontAsset;
            self.turnLabel.element.fontAsset = fontAsset;
            self.ballTypeLabel.element.fontAsset = fontAsset;
        });
        game.app.assets.add(fontAsset);
        game.app.assets.load(fontAsset);
    },

    handleKeyboard() {
        const self = this;

        self.playButton.button.on('click', function(e) {
            self.state = "PLAY";
            self.newGame();
        });

        self.continueButton.button.on('click', function(e) {
            self.state = "PLAY";
            game.newGame();
        });

        self.restartButton.button.on('click', function(e) {
            self.state = "PLAY";
            game.newGame();
            self.newGame();
        });

        self.backMenuButton.button.on('click', function(e) {
            self.state = "START";
            game.newGame();
        });

        self.anotherMatchButton.button.on('click', function(e) {
            self.state = "PLAY";

            game.role.turn ? self.player1Score++ : self.player2Score++;
            self.updateScore();

            game.newGame();
        });
    }
}
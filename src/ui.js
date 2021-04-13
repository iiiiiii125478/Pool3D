const UI = function() {
    this.state = "START"; // PLAY, PAUSE

    UI.screenConfig = {
        referenceResolution: new pc.Vec2(1280, 720),
        scaleBlend: 0.5,
        scaleMode: pc.SCALEMODE_BLEND,
        screenSpace: true
    };

    UI.buttonConfig = {
        anchor: [0.5, 0.5, 0.5, 0.5],
        height: 80,
        pivot: [0.5, 0.5],
        type: pc.ELEMENTTYPE_IMAGE,
        width: 350,
        useInput: true
    }

    UI.labelConfig = {
        anchor: [0.5, 0.5, 0.5, 0.5],
        color: new pc.Color(0, 0, 0),
        fontSize: 64,
        height: 128,
        pivot: [0.5, 0.5],
        text: "",
        type: pc.ELEMENTTYPE_TEXT,
        width: 256,
        wrapLines: true
    };
}

UI.prototype = {
    init(app) {
        this.startScreen(app);
        this.pauseScreen(app);
        this.playScreen(app);
        this.overScreen(app);
        this.turnScrren(app);

        this.loadAsset(app);
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

    startScreen(app) {
        const startMenu = this.getScreenComponent();
        app.root.addChild(startMenu);

        const playButton = this.getButtonComponent();
        startMenu.addChild(playButton);

        const playLabel = this.getLabelComponent({ text: "PLAY", });
        playButton.addChild(playLabel);

        this.startMenu = startMenu;
        this.playButton = playButton;
        this.playLabel = playLabel;
    },

    pauseScreen(app) {
        const pauseMenu = this.getScreenComponent();
        app.root.addChild(pauseMenu);

        const continueButton = this.getButtonComponent({ pivot: [0.5, 0], });
        pauseMenu.addChild(continueButton);

        const continueLabel = this.getLabelComponent({ text: "CONTINUE", });
        continueButton.addChild(continueLabel);

        const restartButton = this.getButtonComponent({ pivot: [0.5, 1.5], });
        pauseMenu.addChild(restartButton);

        const restartLabel = this.getLabelComponent({ text: "RESTART", });
        restartButton.addChild(restartLabel);

        this.pauseMenu = pauseMenu;
        this.continueButton = continueButton;
        this.continueLabel = continueLabel;
        this.restartButton = restartButton;
        this.restartLabel = restartLabel;
    },

    playScreen(app) {
        const playMenu = this.getScreenComponent();
        app.root.addChild(playMenu);

        const player1Button = this.getButtonComponent();
        player1Button.setLocalPosition(
            (game.canvas.clientWidth - 350) / -2,
            (game.canvas.clientHeight - 80) / 2,
            0
        );
        playMenu.addChild(player1Button);

        const player1NameLabel = this.getLabelComponent({
            anchor: [0, 0.5, 0.7, 0.5],
            fontSize: 48,
            text: "NGUYEN",
        });
        player1Button.addChild(player1NameLabel);

        const player1ScoreLabel = this.getLabelComponent({
            anchor: [0.7, 0.5, 0.9, 0.5],
            fontSize: 48,
        });
        player1Button.addChild(player1ScoreLabel);

        const player2Button = this.getButtonComponent();
        player2Button.setLocalPosition(
            (game.canvas.width - 350) / 2,
            (game.canvas.height - 80) / 2,
            0
        );
        playMenu.addChild(player2Button);

        const player2NameLabel = this.getLabelComponent({
            anchor: [0.2, 0.5, 0.9, 0.5],
            fontSize: 48,
            text: "DAT",
        });
        player2Button.addChild(player2NameLabel);

        const player2ScoreLabel = this.getLabelComponent({
            anchor: [0, 0.5, 0.2, 0.5],
            fontSize: 48,

        });
        player2Button.addChild(player2ScoreLabel);

        this.playMenu = playMenu;
        this.player1NameLabel = player1NameLabel;
        this.player2NameLabel = player2NameLabel;
        this.player1ScoreLabel = player1ScoreLabel;
        this.player2ScoreLabel = player2ScoreLabel;
    },

    overScreen(app) {
        const overMenu = this.getScreenComponent();
        app.root.addChild(overMenu);

        const backMenuButton = this.getButtonComponent({ pivot: [0.5, 0], });
        overMenu.addChild(backMenuButton);

        const backMenuLabel = this.getLabelComponent({ text: "BACK MENU", });
        backMenuButton.addChild(backMenuLabel);

        const anotherMatchButton = this.getButtonComponent({ pivot: [0.5, 1.5], });
        overMenu.addChild(anotherMatchButton);

        const anotherMatchLabel = this.getLabelComponent({ text: "CONTINUE", });
        anotherMatchButton.addChild(anotherMatchLabel);

        this.overMenu = overMenu;
        this.backMenuButton = backMenuButton;
        this.backMenuLabel = backMenuLabel;
        this.anotherMatchButton = anotherMatchButton;
        this.anotherMatchLabel = anotherMatchLabel;
    },

    turnScrren(app) {
        const turnMenu = this.getScreenComponent();
        app.root.addChild(turnMenu);

        const turnLabel = this.getLabelComponent({ pivot: [0.5, 0], });
        turnMenu.addChild(turnLabel);

        const ballTypeLabel = this.getLabelComponent({ pivot: [0.5, 1], fontSize: 32, });
        turnMenu.addChild(ballTypeLabel);

        this.turnMenu = turnMenu;
        this.turnLabel = turnLabel;
        this.ballTypeLabel = ballTypeLabel;

        this.turnMenu.enabled = false;
    },

    loadAsset(app) {
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
        app.assets.add(fontAsset);
        app.assets.load(fontAsset);
    },

    handleKeyboard() {
        const self = this;

        self.playButton.button.on('click', function(e) {
            self.state = "PLAY";
            self.newGame();
        });

        self.continueButton.button.on('click', function(e) {
            self.state = "PLAY";
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
    },

    getScreenComponent(screenConfig) {
        const config = {
            ...UI.screenConfig,
            ...screenConfig,
        };

        const screen = new pc.Entity();
        screen.addComponent("screen", config);
        return screen;
    },

    getButtonComponent(buttonConfig) {
        const config = {
            ...UI.buttonConfig,
            ...buttonConfig,
        };

        const button = new pc.Entity();
        button.addComponent("button", {
            imageEntity: button
        });
        button.addComponent("element", config);
        return button;
    },

    getLabelComponent(labelConfig) {
        const config = {
            ...UI.labelConfig,
            ...labelConfig,
        };

        const label = new pc.Entity();
        label.addComponent("element", config);
        return label;
    }
}
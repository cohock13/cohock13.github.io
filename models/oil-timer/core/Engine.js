/**
 * Matter.js物理エンジンの初期化と設定を管理するクラス
 */
export class Engine {
    constructor(oilCanvas, config) {
        if (!Matter || !Matter.Engine) {
            throw new Error('Matter.js library not loaded');
        }

        this.oilCanvas = oilCanvas;
        this.config = config;

        // Matter.jsエンジンの作成
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;

        // Matter.jsの組み込みレンダラーを使用（パーティクルのみ、オイルキャンバス上）
        this.render = Matter.Render.create({
            canvas: this.oilCanvas,
            engine: this.engine,
            options: {
                width: this.oilCanvas.width,
                height: this.oilCanvas.height,
                wireframes: false,
                background: 'transparent',
                showAngleIndicator: false,
                showVelocity: false,
                showDebug: false,
                showStaticBodies: true,
            }
        });

        // 物理設定
        this.engine.world.gravity.y = 1.0;
        this.engine.world.gravity.x = 0;

        this.setupEngineOptions();
        this.setupMouseControl();
    }

    setupEngineOptions() {
        // Matter.jsエンジンオプションの設定
        this.engine.world.gravity.scale = this.config.worldParams.gravityScale;
        this.engine.enableSleeping = false;
        this.engine.positionIterations = this.config.worldParams.positionIterations;
        this.engine.velocityIterations = 6;      // デフォルト 4
        this.engine.constraintIterations = 4;    // デフォルト 2
    }

    setupMouseControl() {
        // マウスコントロールの追加
        this.mouse = Matter.Mouse.create(this.oilCanvas);
        this.mouseConstraint = Matter.MouseConstraint.create(this.engine, {
            mouse: this.mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

        Matter.World.add(this.world, this.mouseConstraint);
    }

    updateRenderSize(width, height) {
        this.render.canvas.width = width;
        this.render.canvas.height = height;
        this.render.options.width = width;
        this.render.options.height = height;
    }

    update(deltaTime) {
        Matter.Engine.update(this.engine, deltaTime);
    }

    clearWorld() {
        Matter.World.clear(this.world);
        Matter.Engine.clear(this.engine);
        // マウスコンストレイントを再追加
        Matter.World.add(this.world, this.mouseConstraint);
    }
}

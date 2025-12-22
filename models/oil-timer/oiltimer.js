/**
 * オイルタイマーシミュレーター
 */
import { Config } from './core/Config.js';
import { Engine } from './core/Engine.js';
import { CanvasManager } from './rendering/CanvasManager.js';
import { BackgroundRenderer } from './rendering/BackgroundRenderer.js';
import { StairsRenderer } from './rendering/StairsRenderer.js';
import { WallsRenderer } from './rendering/WallsRenderer.js';
import { OilRenderer } from './rendering/OilRenderer.js';
import { WorldBuilder } from './physics/WorldBuilder.js';
import { PhysicsUpdater } from './physics/PhysicsUpdater.js';
import { LiquidParticle } from './particles/LiquidParticle.js';
import { ParticleSpawner } from './particles/ParticleSpawner.js';
import { PerformanceMonitor } from './utils/PerformanceMonitor.js';

export class OilTimer {
    constructor() {
        const mainCanvas = document.getElementById('canvas');

        if (!mainCanvas) {
            throw new Error('Canvas element with id "canvas" not found');
        }

        // 設定の初期化
        this.config = new Config();

        // Canvasマネージャーの初期化
        this.canvasManager = new CanvasManager(mainCanvas);

        // 物理エンジンの初期化
        this.physicsEngine = new Engine(this.canvasManager.oilCanvas, this.config);
        this.engine = this.physicsEngine.engine;
        this.world = this.physicsEngine.world;
        this.render = this.physicsEngine.render;

        // レンダラーの初期化
        this.backgroundRenderer = new BackgroundRenderer(this.canvasManager.backgroundCtx, this.canvasManager);
        this.stairsRenderer = new StairsRenderer(this.canvasManager.stairsCtx, this.canvasManager);
        this.wallsRenderer = new WallsRenderer(this.canvasManager.wallsCtx, this.canvasManager);
        this.oilRenderer = new OilRenderer(this.canvasManager.oilCtx, this.canvasManager, this.config);

        // ワールドビルダーの初期化
        this.worldBuilder = new WorldBuilder(this.canvasManager, this.config);

        // 物理更新の初期化
        this.physicsUpdater = new PhysicsUpdater(this.engine, this.config);

        // パーティクルシステムの初期化
        this.liquidParticle = new LiquidParticle(this.config);
        this.particleSpawner = new ParticleSpawner(this.canvasManager, this.config, this.liquidParticle);

        // パフォーマンスモニターの初期化
        this.performanceMonitor = new PerformanceMonitor();

        try {
            this.init();
            this.createWorld();
            this.setupGUI();
            this.animate();

            // デバッグ用にグローバルスコープに公開
            window.liquidOilTimer = this;
        } catch (error) {
            console.error('Failed to initialize OilTimer:', error);
            throw error;
        }
    }

    init() {
        // ウィンドウリサイズの処理
        window.addEventListener('resize', () => {
            this.canvasManager.resizeCanvases();
            this.physicsEngine.updateRenderSize(
                this.canvasManager.getWidth(),
                this.canvasManager.getHeight()
            );
            this.createWorld();
        });
    }

    setupGUI() {
        if (typeof window.lil === 'undefined') {
            setTimeout(() => this.setupGUI(), 100);
            return;
        }

        const gui = new window.lil.GUI({ title: 'オイルタイマー 設定' });

        // 基本コントロール
        gui.add(this.config.params, 'simulationSpeed', 0.5, 3.0, 0.1).name('シミュレーション速度');
        gui.add(this.config.params, 'spawnInterval', 500, 3000, 100).name('オイル出現間隔 (ms)');
        gui.addColor(this.config.params, 'oilColor').name('色').onChange(() => {
            this.physicsUpdater.updateLiquidProperties(this.particleSpawner.getLiquidParticles());
        });

        // 描画設定
        const renderFolder = gui.addFolder('描画設定');
        renderFolder.add(this.config.renderConstants, 'bezierTension', 0.0, 1.0, 0.05).name('スムージング (テンション)');
        renderFolder.add(this.config.renderConstants, 'blurRadius', 0, 10, 0.5).name('ぼかし半径 (px)');
        renderFolder.add(this.config.renderConstants, 'blurAlpha', 0.0, 1.0, 0.05).name('ぼかし透明度');

        gui.add(this.config.liquidSystemParams, 'constraintVisible').name('ばね表示').onChange(() => {
            this.liquidParticle.updateConstraintVisibility(this.particleSpawner.getLiquidParticles());
        });

        gui.add(this, 'reset').name('リセット');
    }

    createWorld() {
        // 既存のボディをクリア
        this.physicsEngine.clearWorld();

        // パーティクルを初期化
        this.particleSpawner.initialize();

        // ガラス容器構造を作成
        this.worldBuilder.createGlassStructure(this.world);

        // 別々のキャンバスに構造をレンダリング
        this.backgroundRenderer.render();
        this.stairsRenderer.render(this.worldBuilder.getStairBodies());
        this.wallsRenderer.render(this.worldBuilder.getWallBodies());
    }

    reset() {
        this.createWorld();
    }

    flip() {
        this.physicsUpdater.flip();

        // フリップ時にすべての球体にインパルスを追加して劇的な効果を演出
        this.particleSpawner.getLiquidParticles().forEach(liquidParticle => {
            liquidParticle.spheres.forEach(sphere => {
                const impulse = {
                    x: (Math.random() - 0.5) * 0.02,
                    y: this.physicsUpdater.getIsFlipped() ? -0.015 : 0.015
                };
                Matter.Body.applyForce(sphere, sphere.position, impulse);
            });
        });

        // 構造表示を更新
        this.stairsRenderer.render(this.worldBuilder.getStairBodies());
        this.wallsRenderer.render(this.worldBuilder.getWallBodies());
    }

    animate() {
        this.physicsUpdater.update(this.particleSpawner.getLiquidParticles());

        // シミュレーション速度に応じて物理演算を複数回実行
        // deltaTimeは一定に保ち、更新回数で速度を調整
        const baseDeltaTime = 1000 / 60; // 60FPSを基準とした固定deltaTime
        const speed = this.config.params.simulationSpeed;

        // 速度が1未満の場合は確率的に更新をスキップ
        if (speed < 1.0) {
            if (Math.random() < speed) {
                Matter.Engine.update(this.engine, baseDeltaTime);
            }
        } else {
            // 速度が1以上の場合は複数回更新
            const updateCount = Math.floor(speed);
            const fractionalPart = speed - updateCount;

            for (let i = 0; i < updateCount; i++) {
                Matter.Engine.update(this.engine, baseDeltaTime);
            }

            // 端数部分を確率的に処理
            if (Math.random() < fractionalPart) {
                Matter.Engine.update(this.engine, baseDeltaTime);
            }
        }

        // 一定間隔で新しいオイルパーティクルをスポーン
        this.particleSpawner.updateOilSpawning(this.world);

        // 画面下に落ちたオイルパーティクルを削除
        this.particleSpawner.removeOffScreenParticles(this.world);

        // オイルキャンバスの背景をクリア
        this.canvasManager.oilCtx.clearRect(
            0,
            0,
            this.canvasManager.getWidth(),
            this.canvasManager.getHeight()
        );

        // オイルパーティクルのカスタムレンダリング（本番モードでステップマスクを含む）
        this.oilRenderer.render(
            this.particleSpawner.getLiquidParticles(),
            this.worldBuilder.getStairBodies()
        );

        this.performanceMonitor.update(this.particleSpawner.getLiquidParticles());

        requestAnimationFrame(() => this.animate());
    }
}

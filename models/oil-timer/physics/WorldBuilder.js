import { StairsBuilder } from './StairsBuilder.js';

/**
 * ワールド（ガラス容器）構造を生成するクラス
 */
export class WorldBuilder {
    constructor(canvasManager, config) {
        this.canvasManager = canvasManager;
        this.config = config;
        this.staticBodies = [];
        this.wallBodies = [];
        this.stairBodies = [];
    }

    createGlassStructure(world) {
        const width = this.canvasManager.getWidth();
        const height = this.canvasManager.getHeight();
        const thickness = this.config.worldParams.wallThickness;

        // コンテナ寸法 - レスポンシブブレークポイント未満ではレスポンシブ、それ以上では固定
        const containerWidth = width < this.config.worldParams.responsiveBreakpoint
            ? width * this.config.worldParams.responsiveWidthRatio
            : this.config.params.containerWidth;
        const containerX = (width - containerWidth) / 2;

        // コンテナ境界（不可視） - 左右の壁のみ（両レーンと衝突）
        const wallOptions = {
            isStatic: true,
            friction: this.config.worldParams.wallFriction,
            frictionStatic: this.config.worldParams.wallFrictionStatic,
            restitution: this.config.worldParams.wallRestitution,
            collisionFilter: {
                category: 0x0003,  // 壁カテゴリ
                mask: 0x0003       // 両レーン（0x0001 | 0x0002）と衝突
            },
            render: { visible: false }
        };

        const boundaries = [
            Matter.Bodies.rectangle(-thickness, height / 2, thickness, height, wallOptions),
            Matter.Bodies.rectangle(width + thickness, height / 2, thickness, height, wallOptions)
        ];
        Matter.World.add(world, boundaries);

        const glassWalls = [];

        // メインコンテナの壁 - 左右の壁のみ（両レーンと衝突）
        // 外側を厚くするために、壁の幅を1.5倍にする
        const outerWallThickness = thickness * 1.5;
        glassWalls.push(
            // 左壁（外側に厚く）
            Matter.Bodies.rectangle(containerX - outerWallThickness / 2, height / 2, outerWallThickness, height, wallOptions),
            // 右壁（外側に厚く）
            Matter.Bodies.rectangle(containerX + containerWidth + outerWallThickness / 2, height / 2, outerWallThickness, height, wallOptions)
        );

        // 液体テスト用の階段を作成 - オリジナルのオイルタイマーに似せる
        StairsBuilder.createLiquidTestStairs(glassWalls, containerX, containerWidth, thickness, height, this.config);

        this.staticBodies = glassWalls;
        Matter.World.add(world, glassWalls);

        // 描画用に階段と壁を分離
        this.separateStructuresForRendering();
    }

    separateStructuresForRendering() {
        this.wallBodies = this.staticBodies.slice(0, 2); // 最初の2つのボディはメイン壁
        this.stairBodies = this.staticBodies.slice(2);   // 残りは階段
    }

    getWallBodies() {
        return this.wallBodies;
    }

    getStairBodies() {
        return this.stairBodies;
    }
}

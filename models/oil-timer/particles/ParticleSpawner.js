/**
 * パーティクルのスポーン管理を行うクラス
 */
export class ParticleSpawner {
    constructor(canvasManager, config, liquidParticle) {
        this.canvasManager = canvasManager;
        this.config = config;
        this.liquidParticle = liquidParticle;
        this.liquidParticles = [];
        this.lastSpawnTime = 0;
        this.nextParticleIndex = 0;
    }

    /**
     * オイルパーティクルをスポーン
     */
    spawnOilParticle(world) {
        const width = this.canvasManager.getWidth();
        const containerWidth = width < this.config.worldParams.responsiveBreakpoint
            ? width * this.config.worldParams.responsiveWidthRatio
            : this.config.params.containerWidth;
        const containerX = (width - containerWidth) / 2;

        // 最初のステップ位置を計算（createLiquidTestStairsのロジックと一致）
        const params = this.config.stairsParams;
        const availableWidth = containerWidth * params.availableWidthRatio;
        const calculatedSteps = Math.floor(availableWidth / params.baseStepWidth);
        const stepsPerPlate = Math.max(params.minSteps, calculatedSteps);
        const actualStepWidth = availableWidth / stepsPerPlate;
        const topY = params.topY;

        // 最初のプレート（i=0）は左向き、最初のステップ（j=0）
        const firstStepX = containerX + actualStepWidth * 0.5;

        // 最初の左ステップの真上にスポーン
        const spawnX = firstStepX;
        const spawnY = topY + this.config.params.spawnYOffset;

        const particle = this.liquidParticle.create(spawnX, spawnY, this.nextParticleIndex);
        this.liquidParticles.push(particle);
        this.nextParticleIndex++;

        // 物理世界に追加
        Matter.World.add(world, particle.spheres);
        Matter.World.add(world, particle.constraints);
    }

    /**
     * オイルスポーンを更新（間隔に基づく）
     */
    updateOilSpawning(world) {
        const currentTime = performance.now();

        if (currentTime - this.lastSpawnTime >= this.config.params.spawnInterval) {
            this.spawnOilParticle(world);
            this.lastSpawnTime = currentTime;
        }
    }

    /**
     * 画面外のパーティクルを削除
     */
    removeOffScreenParticles(world) {
        const screenHeight = this.canvasManager.getHeight();
        const removalThreshold = screenHeight + this.config.params.removalBufferY;

        // 各液体パーティクルシステムをチェック
        this.liquidParticles = this.liquidParticles.filter(liquidParticle => {
            // 全ての球体の平均Y座標を計算
            const avgY = liquidParticle.spheres.reduce((sum, sphere) => sum + sphere.position.y, 0) / liquidParticle.spheres.length;

            if (avgY > removalThreshold) {
                // この液体パーティクルシステムを物理世界から削除
                this.liquidParticle.remove(world, liquidParticle);
                return false; // 配列から削除
            }

            return true; // 配列に保持
        });
    }

    /**
     * 液体パーティクルを初期化
     */
    initialize() {
        this.liquidParticles = [];
        this.nextParticleIndex = 0;
    }

    /**
     * 現在の液体パーティクルを取得
     */
    getLiquidParticles() {
        return this.liquidParticles;
    }
}

/**
 * 物理演算の更新を管理するクラス
 */
export class PhysicsUpdater {
    constructor(engine, config) {
        this.engine = engine;
        this.config = config;
        this.isFlipped = false;
    }

    update(liquidParticles) {
        // 重力を更新
        this.engine.world.gravity.x = 0;
        this.engine.world.gravity.y = this.isFlipped
            ? -this.config.params.gravity
            : this.config.params.gravity;

        // すべての液体パーティクルのプロパティを更新
        this.updateLiquidProperties(liquidParticles);

        // 液体の挙動を強化するための微妙な力を適用
        this.applyLiquidForces(liquidParticles);
    }

    updateLiquidProperties(liquidParticles) {
        liquidParticles.forEach(liquidParticle => {
            liquidParticle.spheres.forEach(sphere => {
                sphere.restitution = this.config.liquidSystemParams.restitution;
                sphere.friction = this.config.liquidSystemParams.friction;
                sphere.frictionAir = this.config.liquidSystemParams.frictionAir;

                // 色を更新
                if (sphere.render) {
                    sphere.render.fillStyle = this.config.params.oilColor;
                }
            });
        });
    }

    applyLiquidForces(liquidParticles) {
        // 液体のような挙動を強化するための追加の力を適用
        liquidParticles.forEach(liquidParticle => {
            let totalMass = 0;
            let comX = 0;
            let comY = 0;

            // すべての球体を使用して重心を計算
            for (const sphere of liquidParticle.spheres) {
                totalMass += sphere.mass;
                comX += sphere.position.x * sphere.mass;
                comY += sphere.position.y * sphere.mass;
            }

            if (totalMass === 0) return;
            comX /= totalMass;
            comY /= totalMass;

            // 現在、追加の凝集力は適用されていません
            // 将来必要に応じて有効にできます
        });
    }

    flip() {
        this.isFlipped = !this.isFlipped;
    }

    getIsFlipped() {
        return this.isFlipped;
    }
}

/**
 * 液体パーティクル（質点系）の生成と管理を行うクラス
 */
export class LiquidParticle {
    constructor(config) {
        this.config = config;
    }

    /**
     * 液体パーティクルを作成（二重楕円構造）
     * @param {string} lane - 'A' or 'B' レーン識別子
     */
    create(centerX, centerY, index, lane = 'A') {
        const spheres = [];
        const constraints = [];
        const numSpheres = this.config.liquidSystemParams.spheresPerParticle;
        const radius = this.config.liquidSystemParams.sphereRadius;

        const outerSpheres = [];
        const innerSpheres = [];
        const angleStep = (2 * Math.PI) / numSpheres;

        // 楕円の基本サイズ
        const base = this.config.liquidSystemParams.length;
        const rxOuter = base * this.config.liquidSystemParams.ellipseX;
        const ryOuter = base * this.config.liquidSystemParams.ellipseY;
        const rxInner = rxOuter * this.config.liquidSystemParams.innerEllipseRatio;
        const ryInner = ryOuter * this.config.liquidSystemParams.innerEllipseRatio;

        // レーンに応じた衝突設定
        // レーンA: category=0x0001, mask=0x0001|0x0003（レーンAのステップと壁と衝突）
        // レーンB: category=0x0002, mask=0x0002|0x0003（レーンBのステップと壁と衝突）
        // 同じレーン内の油滴同士は衝突しないようにgroupを-1に設定
        const collisionCategory = lane === 'A' ? 0x0001 : 0x0002;
        const collisionMask = lane === 'A' ? 0x0001 | 0x0003 : 0x0002 | 0x0003;
        const collisionGroup = -1;  // 同じレーン内の油滴同士は衝突しない
        const oilColor = lane === 'A' ? this.config.params.oilColor : this.config.params.oilColorB;

        // --- 距離計算ヘルパー ---
        const dist = (a, b) => Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y);

        // 1) 外側の楕円の質点を作成
        for (let i = 0; i < numSpheres; i++) {
            const angle = i * angleStep;
            const x = centerX + Math.cos(angle) * rxOuter;
            const y = centerY + Math.sin(angle) * ryOuter;
            const outerSphere = Matter.Bodies.circle(x, y, radius * this.config.liquidSystemParams.outerSphereRadiusRatio, {
                restitution: this.config.liquidSystemParams.restitution,
                friction: this.config.liquidSystemParams.friction,
                frictionAir: this.config.liquidSystemParams.frictionAir,
                density: this.config.liquidSystemParams.density * this.config.liquidSystemParams.outerEllipse.mass,
                collisionFilter: {
                    group: collisionGroup,
                    category: collisionCategory,
                    mask: collisionMask
                },
                render: { fillStyle: oilColor, strokeStyle: 'transparent', lineWidth: 0 },
                liquidIndex: index,
                lane: lane,
                sphereType: 'outer',
                outerIndex: i
            });
            spheres.push(outerSphere);
            outerSpheres.push(outerSphere);
        }

        // 2) 内側の楕円の質点を作成
        for (let i = 0; i < numSpheres; i++) {
            const angle = i * angleStep;
            const x = centerX + Math.cos(angle) * rxInner;
            const y = centerY + Math.sin(angle) * ryInner;
            const innerSphere = Matter.Bodies.circle(x, y, radius * this.config.liquidSystemParams.outerSphereRadiusRatio, {
                restitution: this.config.liquidSystemParams.restitution,
                friction: this.config.liquidSystemParams.friction,
                frictionAir: this.config.liquidSystemParams.frictionAir,
                density: this.config.liquidSystemParams.density * this.config.liquidSystemParams.innerEllipse.mass,
                collisionFilter: {
                    group: collisionGroup,
                    category: collisionCategory,
                    mask: collisionMask
                },
                render: { fillStyle: oilColor, strokeStyle: 'transparent', lineWidth: 0 },
                liquidIndex: index,
                lane: lane,
                sphereType: 'inner',
                innerIndex: i
            });
            spheres.push(innerSphere);
            innerSpheres.push(innerSphere);
        }

        // 3) 外側楕円の隣接点同士をつなぐ
        for (let i = 0; i < numSpheres; i++) {
            const a = outerSpheres[i];
            const b = outerSpheres[(i + 1) % numSpheres];
            constraints.push(
                Matter.Constraint.create({
                    bodyA: a,
                    bodyB: b,
                    length: dist(a, b),
                    stiffness: this.config.liquidSystemParams.outerEllipse.adjacentStiffness,
                    damping: this.config.liquidSystemParams.outerEllipse.adjacentDamping * this.config.liquidSystemParams.outerEllipse.adjacentDampingRatio,
                    render: {
                        visible: this.config.liquidSystemParams.constraintVisible,
                        strokeStyle: '#ffffff',
                        lineWidth: 1
                    }
                })
            );
        }

        // 4) 内側楕円の隣接点同士をつなぐ
        for (let i = 0; i < numSpheres; i++) {
            const a = innerSpheres[i];
            const b = innerSpheres[(i + 1) % numSpheres];
            constraints.push(
                Matter.Constraint.create({
                    bodyA: a,
                    bodyB: b,
                    length: dist(a, b),
                    stiffness: this.config.liquidSystemParams.innerEllipse.adjacentStiffness,
                    damping: this.config.liquidSystemParams.innerEllipse.adjacentDamping * this.config.liquidSystemParams.innerEllipse.adjacentDampingRatio,
                    render: {
                        visible: this.config.liquidSystemParams.constraintVisible,
                        strokeStyle: '#ffffff',
                        lineWidth: 1
                    }
                })
            );
        }

        // 5) 内側楕円の対角線をつなぐ
        for (let i = 0; i < Math.floor(numSpheres / 2); i++) {
            const oppositeIndex = i + Math.floor(numSpheres / 2);
            if (oppositeIndex < numSpheres) {
                constraints.push(
                    Matter.Constraint.create({
                        bodyA: innerSpheres[i],
                        bodyB: innerSpheres[oppositeIndex],
                        length: dist(innerSpheres[i], innerSpheres[oppositeIndex]),
                        stiffness: this.config.liquidSystemParams.innerEllipse.diagonalStiffness,
                        damping: this.config.liquidSystemParams.innerEllipse.diagonalDamping,
                        render: {
                            visible: this.config.liquidSystemParams.constraintVisible,
                            strokeStyle: '#ffffff',
                            lineWidth: 1
                        }
                    })
                );
            }
        }

        // 6) 内外の質点をクロスして接続
        for (let i = 0; i < numSpheres; i++) {
            const innerIndexNext = (i + 1) % numSpheres;  // 一つ隣（時計回り）

            // 外側i → 内側i+1
            constraints.push(
                Matter.Constraint.create({
                    bodyA: outerSpheres[i],
                    bodyB: innerSpheres[innerIndexNext],
                    length: dist(outerSpheres[i], innerSpheres[innerIndexNext]),
                    stiffness: this.config.liquidSystemParams.radialConnection.stiffness,
                    damping: this.config.liquidSystemParams.radialConnection.damping,
                    render: {
                        visible: this.config.liquidSystemParams.constraintVisible,
                        strokeStyle: '#ffffff',
                        lineWidth: 1
                    }
                })
            );

            // 外側i+1 → 内側i (クロス方向)
            const outerIndexNext = (i + 1) % numSpheres;
            constraints.push(
                Matter.Constraint.create({
                    bodyA: outerSpheres[outerIndexNext],
                    bodyB: innerSpheres[i],
                    length: dist(outerSpheres[outerIndexNext], innerSpheres[i]),
                    stiffness: this.config.liquidSystemParams.radialConnection.stiffness,
                    damping: this.config.liquidSystemParams.radialConnection.damping,
                    render: {
                        visible: this.config.liquidSystemParams.constraintVisible,
                        strokeStyle: '#ffffff',
                        lineWidth: 1
                    }
                })
            );
        }

        return { index, spheres, constraints, centerSphere: null };
    }

    /**
     * 液体パーティクルを削除
     */
    remove(world, liquidParticle) {
        if (liquidParticle.spheres.length > 0) {
            Matter.World.remove(world, liquidParticle.spheres);
        }
        if (liquidParticle.constraints.length > 0) {
            Matter.World.remove(world, liquidParticle.constraints);
        }
    }

    /**
     * 制約の可視性を更新
     */
    updateConstraintVisibility(liquidParticles) {
        liquidParticles.forEach(liquidParticle => {
            liquidParticle.constraints.forEach(constraint => {
                constraint.render.visible = this.config.liquidSystemParams.constraintVisible;
            });
        });
    }
}

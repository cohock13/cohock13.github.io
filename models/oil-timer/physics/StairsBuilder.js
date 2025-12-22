/**
 * 階段構造を生成するクラス
 */
export class StairsBuilder {
    /**
     * 液体テスト用の階段を作成（レーンA + 中央ミラーリングしたレーンB）
     */
    static createLiquidTestStairs(glassWalls, containerX, containerWidth, thickness, height, config) {
        const params = config.stairsParams;
        const plateCount = params.plateCount;
        const baseStepWidth = params.baseStepWidth;
        const stepHeight = params.stepHeight;
        const availableWidth = containerWidth * params.availableWidthRatio;
        const minSteps = params.minSteps;
        const calculatedSteps = Math.floor(availableWidth / baseStepWidth);
        const stepsPerPlate = Math.max(minSteps, calculatedSteps);
        const actualStepWidth = availableWidth / stepsPerPlate;
        const topY = params.topY;
        const margin = params.margin;

        // 中央軸の計算（ミラーリングの基準）
        const centerX = containerX + containerWidth / 2;

        for (let i = 0; i < plateCount; i++) {
            let baseY;

            if (i === 0) {
                // 最上段は固定（オイル出現地点近く）
                baseY = topY;
            } else {
                // 各プレートに余白 + 階段高さの合計分だけ下にずらす
                const previousStepHeight = stepsPerPlate * (stepHeight / 2);
                baseY = topY + i * (previousStepHeight + margin);
            }

            const isLeftOriented = i % 2 === 0;

            for (let j = 0; j < stepsPerPlate; j++) {
                // 最初のステップ（j=0）はオイルが詰まるのを防ぐために急な角度にする
                const baseAngle = params.baseAngle;
                const angleMultiplier = j === 0 ? params.firstStepAngleMultiplier : params.normalStepAngleMultiplier;
                const stepAngle_A = (isLeftOriented ? baseAngle : -baseAngle) * angleMultiplier;

                // レーンAのステップ位置を計算
                const stepX_A = isLeftOriented
                    ? containerX + actualStepWidth * (j + 0.5)  // 左から詰める
                    : containerX + containerWidth - actualStepWidth * (j + 0.5); // 右から詰める

                const stepY = baseY + j * (stepHeight / 2);

                // 壁に隣接するステップ（j=0）は、隙間からオイルが滑り落ちるのを防ぐために長くする
                let stepWidthIndividual;
                let adjustedStepX_A = stepX_A;

                if (j === 0) {
                    // 最初のステップ - 壁の端まで伸ばす（ただし外には出ない）
                    stepWidthIndividual = actualStepWidth * params.firstStepWidthMultiplier;
                    // 壁に到達するように位置をシフト
                    adjustedStepX_A = isLeftOriented
                        ? stepX_A - actualStepWidth * params.firstStepPositionOffset
                        : stepX_A + actualStepWidth * params.firstStepPositionOffset;
                } else {
                    // その他のステップ - 通常サイズ
                    stepWidthIndividual = actualStepWidth;
                }

                // レーンAのステップを生成（レーンAの油滴とのみ衝突）
                const stepSurface_A = Matter.Bodies.rectangle(
                    adjustedStepX_A,
                    stepY,
                    stepWidthIndividual,
                    thickness * params.stepThicknessRatio,
                    {
                        isStatic: true,
                        angle: stepAngle_A,
                        friction: config.worldParams.wallFriction,
                        frictionStatic: config.worldParams.wallFrictionStatic,
                        restitution: config.worldParams.wallRestitution,
                        chamfer: { radius: params.chamferRadius },
                        collisionFilter: {
                            category: 0x0001,  // レーンAのステップカテゴリ
                            mask: 0x0001       // レーンAの油滴とのみ衝突
                        },
                        render: { visible: false },
                        lane: 'A'
                    }
                );
                glassWalls.push(stepSurface_A);

                // レーンBのステップを中央軸でミラーリングして生成（レーンBの油滴とのみ衝突）
                const adjustedStepX_B = 2 * centerX - adjustedStepX_A;
                const stepAngle_B = -stepAngle_A;  // 角度を反転

                const stepSurface_B = Matter.Bodies.rectangle(
                    adjustedStepX_B,
                    stepY,
                    stepWidthIndividual,
                    thickness * params.stepThicknessRatio,
                    {
                        isStatic: true,
                        angle: stepAngle_B,
                        friction: config.worldParams.wallFriction,
                        frictionStatic: config.worldParams.wallFrictionStatic,
                        restitution: config.worldParams.wallRestitution,
                        chamfer: { radius: params.chamferRadius },
                        collisionFilter: {
                            category: 0x0002,  // レーンBのステップカテゴリ
                            mask: 0x0002       // レーンBの油滴とのみ衝突
                        },
                        render: { visible: false },
                        lane: 'B'
                    }
                );
                glassWalls.push(stepSurface_B);
            }
        }
    }
}

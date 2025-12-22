/**
 * 階段構造を生成するクラス
 */
export class StairsBuilder {
    /**
     * 液体テスト用の階段を作成
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
                const stepAngle = (isLeftOriented ? baseAngle : -baseAngle) * angleMultiplier;

                // レスポンシブな幅でステップの位置を計算
                const stepX = isLeftOriented
                    ? containerX + actualStepWidth * (j + 0.5)  // 左から詰める
                    : containerX + containerWidth - actualStepWidth * (j + 0.5); // 右から詰める

                const stepY = baseY + j * (stepHeight / 2);

                // 壁に隣接するステップ（j=0）は、隙間からオイルが滑り落ちるのを防ぐために長くする
                // 壁の端まで伸びるが、外には出ない
                let stepWidthIndividual;
                let adjustedStepX = stepX;

                if (j === 0) {
                    // 最初のステップ - 壁の端まで伸ばす（ただし外には出ない）
                    stepWidthIndividual = actualStepWidth * params.firstStepWidthMultiplier;
                    // 壁に到達するように位置をシフト
                    adjustedStepX = isLeftOriented
                        ? stepX - actualStepWidth * params.firstStepPositionOffset
                        : stepX + actualStepWidth * params.firstStepPositionOffset;
                } else {
                    // その他のステップ - 通常サイズ
                    stepWidthIndividual = actualStepWidth;
                }

                const stepSurface = Matter.Bodies.rectangle(
                    adjustedStepX,
                    stepY,
                    stepWidthIndividual,
                    thickness * params.stepThicknessRatio,
                    {
                        isStatic: true,
                        angle: stepAngle,
                        friction: config.worldParams.wallFriction,
                        frictionStatic: config.worldParams.wallFrictionStatic,
                        restitution: config.worldParams.wallRestitution,
                        chamfer: { radius: params.chamferRadius },
                        render: { visible: false }
                    }
                );

                glassWalls.push(stepSurface);
            }
        }
    }
}

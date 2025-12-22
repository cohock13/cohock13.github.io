/**
 * 階段の描画を担当するクラス
 */
export class StairsRenderer {
    constructor(stairsCtx, canvasManager, config, lane = 'A') {
        this.ctx = stairsCtx;
        this.canvasManager = canvasManager;
        this.config = config;
        this.lane = lane;
    }

    render(stairBodies) {
        // 階段キャンバスをクリア
        this.ctx.clearRect(0, 0, this.canvasManager.getWidth(), this.canvasManager.getHeight());

        // 階段ボディをレンダリング（指定レーンのみ）
        if (stairBodies) {
            stairBodies.forEach(body => {
                // 指定されたレーンのステップのみ描画
                if (body.lane === this.lane) {
                    const strokeColor = this.lane === 'B'
                        ? this.config.params.stepColorB
                        : this.config.params.stepColorA;
                    this.renderStepOutline(body, strokeColor);
                }
            });
        }
    }

    renderStepOutline(body, strokeStyle) {
        // 背景色で塗りつぶし + 枠線を描画
        this.ctx.fillStyle = this.config.params.backgroundColor;
        this.ctx.strokeStyle = strokeStyle;
        this.ctx.lineWidth = 2;

        // ボディタイプに基づいてレンダリング
        if (body.circleRadius) {
            // 円形ボディ（バンプ）
            this.ctx.beginPath();
            this.ctx.arc(body.position.x, body.position.y, body.circleRadius, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
        } else {
            // 矩形ボディ（壁とプレート）
            const vertices = body.vertices;
            if (vertices.length > 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(vertices[0].x, vertices[0].y);
                for (let i = 1; i < vertices.length; i++) {
                    this.ctx.lineTo(vertices[i].x, vertices[i].y);
                }
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
            }
        }
    }
}

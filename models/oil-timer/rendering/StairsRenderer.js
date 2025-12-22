/**
 * 階段の描画を担当するクラス
 */
export class StairsRenderer {
    constructor(stairsCtx, canvasManager) {
        this.ctx = stairsCtx;
        this.canvasManager = canvasManager;
    }

    render(stairBodies) {
        // 階段キャンバスをクリア
        this.ctx.clearRect(0, 0, this.canvasManager.getWidth(), this.canvasManager.getHeight());

        // 階段ボディをレンダリング
        if (stairBodies) {
            stairBodies.forEach(body => {
                this.renderGlassBody(body, 'rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.4)');
            });
        }
    }

    renderGlassBody(body, fillStyle, strokeStyle) {
        // ガラスの外観
        this.ctx.fillStyle = fillStyle;
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

                // ガラスのハイライトを追加
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        }
    }
}

/**
 * 壁の描画を担当するクラス
 */
export class WallsRenderer {
    constructor(wallsCtx, canvasManager) {
        this.ctx = wallsCtx;
        this.canvasManager = canvasManager;
    }

    render(wallBodies) {
        // 壁キャンバスをクリア
        this.ctx.clearRect(0, 0, this.canvasManager.getWidth(), this.canvasManager.getHeight());

        // 壁ボディをレンダリング - 階段の端を隠すために不透明な背景を使用
        if (wallBodies) {
            wallBodies.forEach(body => {
                // まず階段を隠すために黒い背景を描画
                this.renderGlassBody(body, '#000000', 'rgba(255, 255, 255, 0.6)');
                // 次に半透明のガラスを上に描画
                this.renderGlassBody(body, 'rgba(255, 255, 255, 0.1)', 'transparent');
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

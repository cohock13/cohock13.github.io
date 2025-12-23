/**
 * 壁の描画を担当するクラス
 */
export class WallsRenderer {
    constructor(wallsCtx, canvasManager, config) {
        this.ctx = wallsCtx;
        this.canvasManager = canvasManager;
        this.config = config;
    }

    render(wallBodies) {
        // 壁キャンバスをクリア
        this.ctx.clearRect(0, 0, this.canvasManager.getWidth(), this.canvasManager.getHeight());

        // 壁ボディをレンダリング - 背景色で塗りつぶし
        if (wallBodies) {
            wallBodies.forEach(body => {
                this.renderWallBody(body);
            });
        }
    }

    renderWallBody(body) {
        // 背景色で塗りつぶし + 白い枠線
        this.ctx.fillStyle = this.config.params.backgroundColor;
        this.ctx.strokeStyle = '#ababab';
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

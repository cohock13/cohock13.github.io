/**
 * 背景の描画を担当するクラス
 */
export class BackgroundRenderer {
    constructor(backgroundCtx, canvasManager, config) {
        this.ctx = backgroundCtx;
        this.canvasManager = canvasManager;
        this.config = config;
    }

    render() {
        // 背景キャンバスをクリアして背景色で塗りつぶし
        this.ctx.fillStyle = this.config.params.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvasManager.getWidth(), this.canvasManager.getHeight());
    }
}

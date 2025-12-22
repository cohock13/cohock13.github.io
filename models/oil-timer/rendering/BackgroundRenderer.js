/**
 * 背景の描画を担当するクラス
 */
export class BackgroundRenderer {
    constructor(backgroundCtx, canvasManager) {
        this.ctx = backgroundCtx;
        this.canvasManager = canvasManager;
    }

    render() {
        // 背景キャンバスをクリアして暗い背景を追加
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvasManager.getWidth(), this.canvasManager.getHeight());
    }
}

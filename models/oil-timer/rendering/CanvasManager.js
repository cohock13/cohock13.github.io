/**
 * 複数のCanvasレイヤーを管理するクラス
 */
export class CanvasManager {
    constructor(mainCanvas) {
        this.mainCanvas = mainCanvas;

        // 異なるレイヤー用の個別のキャンバスを作成
        this.backgroundCanvas = document.createElement('canvas');
        this.backgroundCtx = this.backgroundCanvas.getContext('2d');

        this.oilCanvas = document.createElement('canvas');
        this.oilCtx = this.oilCanvas.getContext('2d');

        this.stairsCanvas = document.createElement('canvas');
        this.stairsCtx = this.stairsCanvas.getContext('2d');

        this.wallsCanvas = document.createElement('canvas');
        this.wallsCtx = this.wallsCanvas.getContext('2d');

        this.setupCanvasLayers();
        this.resizeCanvases();
    }

    setupCanvasLayers() {
        const parentElement = this.mainCanvas.parentNode;

        // 背景キャンバスの設定 (z-index: 1)
        this.backgroundCanvas.style.position = 'absolute';
        this.backgroundCanvas.style.top = '0';
        this.backgroundCanvas.style.left = '0';
        this.backgroundCanvas.style.zIndex = '1';

        // オイルキャンバスの設定 (z-index: 2)
        this.oilCanvas.style.position = 'absolute';
        this.oilCanvas.style.top = '0';
        this.oilCanvas.style.left = '0';
        this.oilCanvas.style.zIndex = '2';

        // 階段キャンバスの設定 (z-index: 3)
        this.stairsCanvas.style.position = 'absolute';
        this.stairsCanvas.style.top = '0';
        this.stairsCanvas.style.left = '0';
        this.stairsCanvas.style.zIndex = '3';

        // 壁キャンバスの設定 (z-index: 4)
        this.wallsCanvas.style.position = 'absolute';
        this.wallsCanvas.style.top = '0';
        this.wallsCanvas.style.left = '0';
        this.wallsCanvas.style.zIndex = '4';

        // カスタムレイヤーを使用するため、元のキャンバスは非表示にする
        this.mainCanvas.style.display = 'none';

        // すべてのキャンバスを順番に挿入
        parentElement.insertBefore(this.backgroundCanvas, this.mainCanvas);
        parentElement.insertBefore(this.oilCanvas, this.mainCanvas);
        parentElement.insertBefore(this.stairsCanvas, this.mainCanvas);
        parentElement.insertBefore(this.wallsCanvas, this.mainCanvas);
    }

    resizeCanvases() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // すべてのキャンバスをリサイズ
        this.mainCanvas.width = width;
        this.mainCanvas.height = height;
        this.backgroundCanvas.width = width;
        this.backgroundCanvas.height = height;
        this.oilCanvas.width = width;
        this.oilCanvas.height = height;
        this.stairsCanvas.width = width;
        this.stairsCanvas.height = height;
        this.wallsCanvas.width = width;
        this.wallsCanvas.height = height;
    }

    getWidth() {
        return this.mainCanvas.width;
    }

    getHeight() {
        return this.mainCanvas.height;
    }
}

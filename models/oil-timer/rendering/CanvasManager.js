/**
 * 複数のCanvasレイヤーを管理するクラス
 */
export class CanvasManager {
    constructor(mainCanvas) {
        this.mainCanvas = mainCanvas;

        // 異なるレイヤー用の個別のキャンバスを作成
        this.backgroundCanvas = document.createElement('canvas');
        this.backgroundCtx = this.backgroundCanvas.getContext('2d');

        this.wallsCanvas = document.createElement('canvas');
        this.wallsCtx = this.wallsCanvas.getContext('2d');

        this.stairsCanvasA = document.createElement('canvas');
        this.stairsCtxA = this.stairsCanvasA.getContext('2d');

        this.oilCanvasA = document.createElement('canvas');
        this.oilCtxA = this.oilCanvasA.getContext('2d');

        this.stairsCanvasB = document.createElement('canvas');
        this.stairsCtxB = this.stairsCanvasB.getContext('2d');

        this.oilCanvasB = document.createElement('canvas');
        this.oilCtxB = this.oilCanvasB.getContext('2d');

        // 物理エンジン用のキャンバス（非表示）
        this.oilCanvas = this.oilCanvasA;
        this.oilCtx = this.oilCtxA;

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

        // レーンB オイルキャンバスの設定 (z-index: 2) - 最背面
        this.oilCanvasB.style.position = 'absolute';
        this.oilCanvasB.style.top = '0';
        this.oilCanvasB.style.left = '0';
        this.oilCanvasB.style.zIndex = '2';

        // レーンB 階段キャンバスの設定 (z-index: 3)
        this.stairsCanvasB.style.position = 'absolute';
        this.stairsCanvasB.style.top = '0';
        this.stairsCanvasB.style.left = '0';
        this.stairsCanvasB.style.zIndex = '3';

        // レーンA オイルキャンバスの設定 (z-index: 4)
        this.oilCanvasA.style.position = 'absolute';
        this.oilCanvasA.style.top = '0';
        this.oilCanvasA.style.left = '0';
        this.oilCanvasA.style.zIndex = '4';

        // レーンA 階段キャンバスの設定 (z-index: 5)
        this.stairsCanvasA.style.position = 'absolute';
        this.stairsCanvasA.style.top = '0';
        this.stairsCanvasA.style.left = '0';
        this.stairsCanvasA.style.zIndex = '5';

        // 壁キャンバスの設定 (z-index: 6) - 最前面
        this.wallsCanvas.style.position = 'absolute';
        this.wallsCanvas.style.top = '0';
        this.wallsCanvas.style.left = '0';
        this.wallsCanvas.style.zIndex = '6';

        // カスタムレイヤーを使用するため、元のキャンバスは非表示にする
        this.mainCanvas.style.display = 'none';

        // すべてのキャンバスを順番に挿入（z-indexの順）
        parentElement.insertBefore(this.backgroundCanvas, this.mainCanvas);
        parentElement.insertBefore(this.oilCanvasB, this.mainCanvas);
        parentElement.insertBefore(this.stairsCanvasB, this.mainCanvas);
        parentElement.insertBefore(this.oilCanvasA, this.mainCanvas);
        parentElement.insertBefore(this.stairsCanvasA, this.mainCanvas);
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
        this.wallsCanvas.width = width;
        this.wallsCanvas.height = height;
        this.stairsCanvasA.width = width;
        this.stairsCanvasA.height = height;
        this.oilCanvasA.width = width;
        this.oilCanvasA.height = height;
        this.stairsCanvasB.width = width;
        this.stairsCanvasB.height = height;
        this.oilCanvasB.width = width;
        this.oilCanvasB.height = height;
    }

    getWidth() {
        return this.mainCanvas.width;
    }

    getHeight() {
        return this.mainCanvas.height;
    }
}

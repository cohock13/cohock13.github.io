/**
 * オイルタイマーの設定値を管理するクラス
 */
export class Config {
    constructor() {
        // 物理パラメータ
        this.params = {
            gravity: 0.5,                // 重力の強さ
            oilColor: '#e63946',         // レーンAのオイルの色
            oilColorB: '#88b04b',        // レーンBのオイルの色
            stepColorA: '#ababab',       // レーンAのステップ枠線の色
            stepColorB: '#474747',       // レーンBのステップ枠線の色
            backgroundColor: '#1a1a1a',  // 背景色（壁・ステップの塗りつぶし色）
            spawnInterval: 900,         // オイル出現間隔（ミリ秒）
            containerWidth: 800,         // 固定幅のオイルタイマーコンテナ幅（ピクセル）
            spawnYOffset: -70,           // スポーン位置の垂直オフセット（階段の上）
            removalBufferY: 100,         // パーティクル削除の垂直バッファ（画面下）
            simulationSpeed: 2.0         // シミュレーション速度（0.5～3.0の範囲）
        };

        // 液体パーティクルシステムのパラメータ（p5jsのソフトボディ物理学に基づく）
        this.liquidSystemParams = {
            spheresPerParticle: 20,      // 各楕円あたりの球体数
            sphereRadius: 3,             // 各球体の半径
            outerSphereRadiusRatio: 0.85, // 外周球体の半径比率
            restitution: 0.8,            // 個々の球体の反発係数
            length: 30,                  // ばねの自然長（少し短めにすると収縮力が働く）
            friction: 0.000,             // 摩擦係数
            frictionAir: 0.03,          // 空気抵抗
            density: 0.01,               // 密度
            constraintVisible: false,     // ばねの表示/非表示

            // 楕円形状パラメータ
            ellipseX: 1.00,              // 水平方向の楕円比率
            ellipseY: 1.00,              // 垂直方向の楕円比率
            innerEllipseRatio: 0.5,      // 内側楕円のサイズ比率（外側楕円に対する）

            // 大きい楕円（外側）のパラメータ
            outerEllipse: {
                mass: 0.03,               // 質点の質量倍率
                adjacentStiffness: 0.10, // 隣接点間のばねの硬さ
                adjacentDamping: 0.00,   // 隣接点間のばねの減衰
                adjacentDampingRatio: 0.3 // 隣接点間の減衰比率
            },

            // 小さい楕円（内側）のパラメータ
            innerEllipse: {
                mass: 0.05,               // 質点の質量倍率
                adjacentStiffness: 0.05, // 隣接点間のばねの硬さ
                adjacentDamping: 0.01,   // 隣接点間のばねの減衰
                adjacentDampingRatio: 0.0, // 隣接点間の減衰比率
                diagonalStiffness: 0.042,  // 対角線のばねの硬さ
                diagonalDamping: 0.00    // 対角線のばねの減衰
            },

            // 内外接続のパラメータ
            radialConnection: {
                stiffness: 0.18,          // 内外を繋ぐばねの硬さ
                damping: 0.000            // 内外を繋ぐばねの減衰
            }
        };

        // ワールド構造のパラメータ
        this.worldParams = {
            wallThickness: 30,           // 壁の厚さ
            responsiveBreakpoint: 900,   // レスポンシブのブレークポイント（px）
            responsiveWidthRatio: 0.92,  // レスポンシブ時のコンテナ幅比率
            wallFriction: 0,             // 壁の摩擦係数
            wallFrictionStatic: 0,       // 壁の静的摩擦係数
            wallRestitution: 0,          // 壁の反発係数
            gravityScale: 0.0015,        // 物理エンジンの重力スケール
            positionIterations: 10       // 物理エンジンの位置イテレーション数
        };

        // 階段構造のパラメータ
        this.stairsParams = {
            plateCount: 10,              // プレート数
            baseStepWidth: 120,           // 基本のステップ幅
            stepHeight: 100,              // 各ステップの縦の進み幅
            availableWidthRatio: 0.9,    // コンテナ幅に対する利用可能幅の比率
            minSteps: 3,                 // 最小ステップ数（これ以下だと油が流れない）
            topY: 100,                    // 一番上の階段の基準高さ
            margin: 10,                  // プレート間のマージン
            baseAngle: 0.05,             // ステップの基本角度
            firstStepAngleMultiplier: 7.5,  // 最初のステップの角度倍率
            normalStepAngleMultiplier: 2,    // 通常のステップの角度倍率
            firstStepWidthMultiplier: 1.4,   // 最初のステップの幅倍率
            firstStepPositionOffset: 0.10,   // 最初のステップの位置オフセット
            stepThicknessRatio: 0.75,     // 壁の厚さに対するステップの厚さの比率
            chamferRadius: 6             // ステップの角の丸み
        };

        // 描画定数
        this.renderConstants = {
            // Catmull-Romスプラインのテンション（スムージング度合い）
            // 0.0 = 直線的（スムージングなし）
            // 0.5 = 標準的なスムージング（デフォルト）
            // 1.0 = 非常に滑らか（過度にスムーズ）
            bezierTension: 0.5,
            bezierTensionDivisor: 6,     // Catmull-Romスプライン計算の除数

            // ブラー効果
            blurRadius: 1,               // ブラー効果の半径（ピクセル）
            blurAlpha: 0.55,             // ブラーレイヤーの透明度

            // ソリッドレイヤー
            solidAlpha: 1.0,             // ソリッドレイヤーの透明度

            // デバッグモード表示
            debugConstraintColor: '#ffffff',  // ばねの線の色
            debugConstraintWidth: 1      // ばねの線の太さ
        };
    }
}

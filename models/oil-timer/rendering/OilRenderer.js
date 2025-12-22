import { GeometryUtils } from '../utils/GeometryUtils.js';

/**
 * オイルパーティクルの描画を担当するクラス
 */
export class OilRenderer {
    constructor(oilCtx, canvasManager, config) {
        this.ctx = oilCtx;
        this.canvasManager = canvasManager;
        this.config = config;
    }

    render(liquidParticles, stairBodies) {
        const productionMode = !this.config.liquidSystemParams.constraintVisible;

        liquidParticles.forEach(liquidParticle => {
            if (!productionMode) {
                // デバッグモード: 制約（ばね）をシンプルな白線として描画
                this.renderConstraints(liquidParticle);
                // デバッグモードで球体（パーティクル）をレンダリング
                this.renderSpheres(liquidParticle);
            } else {
                // 本番モード: スムーズなブロブを描画
                this.renderSmoothBlob(liquidParticle);
            }
        });

        // ✅ 本番モードでのみ、階段への「めり込み」を描画だけで防止
        // オイルキャンバスに描いた油を、階段形状で切り抜く（ブラーも含めて消える）
        if (productionMode) {
            this.applyStepMask(stairBodies);
        }
    }

    renderConstraints(liquidParticle) {
        this.ctx.strokeStyle = this.config.renderConstants.debugConstraintColor;
        this.ctx.lineWidth = this.config.renderConstants.debugConstraintWidth;

        liquidParticle.constraints.forEach(constraint => {
            const posA = constraint.bodyA.position;
            const posB = constraint.bodyB.position;

            this.ctx.beginPath();
            this.ctx.moveTo(posA.x, posA.y);
            this.ctx.lineTo(posB.x, posB.y);
            this.ctx.stroke();
        });
    }

    renderSpheres(liquidParticle) {
        liquidParticle.spheres.forEach((sphere, index) => {
            const radius = index === 0
                ? this.config.liquidSystemParams.sphereRadius
                : this.config.liquidSystemParams.sphereRadius * this.config.liquidSystemParams.outerSphereRadiusRatio;

            this.ctx.fillStyle = this.config.params.oilColor;
            this.ctx.beginPath();
            this.ctx.arc(sphere.position.x, sphere.position.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    /**
     * ✅ 階段形状で油を「描画的に」切り抜く
     * globalCompositeOperation = 'destination-out'
     * -> すでに描かれている油のピクセルを、階段領域で削除する
     */
    applyStepMask(stairBodies) {
        if (!stairBodies || stairBodies.length === 0) return;

        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-out';

        for (const body of stairBodies) {
            const verts = body.vertices;
            if (!verts || verts.length < 3) continue;

            this.ctx.beginPath();
            this.ctx.moveTo(verts[0].x, verts[0].y);
            for (let i = 1; i < verts.length; i++) {
                this.ctx.lineTo(verts[i].x, verts[i].y);
            }
            this.ctx.closePath();
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    /**
     * ✅ シンプルな塗りつぶし描画（二重楕円構造対応）
     * - 外側楕円の質点を直線で結んで塗りつぶすのみ
     */
    renderSmoothBlob(liquidParticle) {
        const spheres = liquidParticle.spheres;
        if (spheres.length < 3) return;

        // 外側楕円の質点のみを抽出（sphereType が 'outer' のもの）
        const outerSpheres = spheres.filter(s => s.sphereType === 'outer');
        if (outerSpheres.length < 3) return;

        // 重心を計算
        const centerX = outerSpheres.reduce((sum, s) => sum + s.position.x, 0) / outerSpheres.length;
        const centerY = outerSpheres.reduce((sum, s) => sum + s.position.y, 0) / outerSpheres.length;
        const center = { x: centerX, y: centerY };

        // 外周を角度順に並べ替え
        const sorted = this.sortOuterSpheresByAngle(outerSpheres, center);

        // 直線で質点をつなぎ、塗りつぶす
        this.ctx.fillStyle = this.config.params.oilColor;
        this.ctx.strokeStyle = this.config.params.oilColor;
        this.ctx.beginPath();
        this.ctx.moveTo(sorted[0].x, sorted[0].y);
        for (let i = 1; i < sorted.length; i++) {
            this.ctx.lineTo(sorted[i].x, sorted[i].y);
        }
        this.ctx.closePath();
        // this.ctx.fill();
        this.ctx.stroke();
    }

    sortOuterSpheresByAngle(outerSpheres, center) {
        return outerSpheres
            .map(s => ({
                x: s.position.x,
                y: s.position.y,
                angle: Math.atan2(s.position.y - center.y, s.position.x - center.x)
            }))
            .sort((a, b) => a.angle - b.angle);
    }

    /**
     * 点の中心を通るスムーズなベジェ曲線パスを作成
     * Catmull-Rom スプラインを使用して、各点を通る滑らかな曲線を生成
     */
    createSmoothBezierPath(points) {
        const path = new Path2D();
        const n = points.length;

        if (n < 3) {
            // 点が少ない場合は単純なパスを描画
            path.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < n; i++) {
                path.lineTo(points[i].x, points[i].y);
            }
            path.closePath();
            return path;
        }

        // Catmull-Romスプラインのテンション（設定から取得）
        const tension = this.config.renderConstants.bezierTension;

        path.moveTo(points[0].x, points[0].y);

        // 各セグメントに対してCatmull-Romスプラインを計算
        for (let i = 0; i < n; i++) {
            const p0 = points[(i - 1 + n) % n];  // 前の点
            const p1 = points[i];                 // 現在の点
            const p2 = points[(i + 1) % n];       // 次の点
            const p3 = points[(i + 2) % n];       // 次の次の点

            // Catmull-Romスプラインの制御点を計算
            const divisor = this.config.renderConstants.bezierTensionDivisor;
            const cp1x = p1.x + (p2.x - p0.x) * (tension / divisor);
            const cp1y = p1.y + (p2.y - p0.y) * (tension / divisor);
            const cp2x = p2.x - (p3.x - p1.x) * (tension / divisor);
            const cp2y = p2.y - (p3.y - p1.y) * (tension / divisor);

            // ベジェ曲線を追加（p1からp2へ）
            path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }

        path.closePath();
        return path;
    }

    drawBlobPath(path) {
        // ブラーレイヤー
        this.ctx.save();
        this.ctx.fillStyle = this.config.params.oilColor;
        this.ctx.filter = `blur(${this.config.renderConstants.blurRadius}px)`;
        this.ctx.globalAlpha = this.config.renderConstants.blurAlpha;
        this.ctx.fill(path);
        this.ctx.restore();

        // ソリッドレイヤー
        this.ctx.fillStyle = this.config.params.oilColor;
        this.ctx.globalAlpha = this.config.renderConstants.solidAlpha;
        this.ctx.fill(path);
    }
}

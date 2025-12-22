/**
 * 幾何計算のヘルパー関数を提供するユーティリティクラス
 */
export class GeometryUtils {
    /**
     * 線形補間
     */
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * ベクトルの内積
     */
    static dot(ax, ay, bx, by) {
        return ax * bx + ay * by;
    }

    /**
     * ベクトルの正規化
     */
    static normalize(x, y) {
        const d = Math.hypot(x, y) || 1;
        return { x: x / d, y: y / d };
    }

    /**
     * 楕円上の特定方向における半径を計算（長軸/短軸明示版）
     */
    static ellipseRadiusAlongDirectionMajorMinor(nx, ny, uMajor, uMinor, a, b) {
        const d1 = GeometryUtils.dot(nx, ny, uMajor.x, uMajor.y);
        const d2 = GeometryUtils.dot(nx, ny, uMinor.x, uMinor.y);
        const a2 = a * a;
        const b2 = b * b;
        const denom = Math.sqrt((d1 * d1) / a2 + (d2 * d2) / b2) || 1;
        return 1 / denom;
    }

    /**
     * ループを軸で左右に分割
     */
    static splitLoopByAxis(loop, center, axis) {
        const n = loop.length;
        const s = new Array(n);

        for (let i = 0; i < n; i++) {
            const dx = loop[i].x - center.x;
            const dy = loop[i].y - center.y;
            s[i] = GeometryUtils.dot(dx, dy, axis.x, axis.y);
        }

        // 符号変化のインデックスを見つける
        const cuts = [];
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            if ((s[i] >= 0 && s[j] < 0) || (s[i] < 0 && s[j] >= 0)) {
                cuts.push(i);
            }
        }

        // 切断できない場合は半分で分ける
        if (cuts.length < 2) {
            const half = Math.floor(n / 2);
            return { negArc: loop.slice(0, half), posArc: loop.slice(half) };
        }

        const c1 = cuts[0];
        const c2 = cuts[1];

        // c1->c2が片側、残りがもう片側
        const arc1 = [];
        for (let k = 0; k <= (c2 - c1 + n) % n; k++) {
            arc1.push(loop[(c1 + 1 + k) % n]);
        }
        const arc2 = [];
        for (let k = 0; k <= (c1 - c2 + n) % n; k++) {
            arc2.push(loop[(c2 + 1 + k) % n]);
        }

        // 平均符号で「左（neg）/右（pos）」を決める
        const mean1 = arc1.reduce((acc, p) => acc + GeometryUtils.dot(p.x - center.x, p.y - center.y, axis.x, axis.y), 0) / arc1.length;
        const mean2 = arc2.reduce((acc, p) => acc + GeometryUtils.dot(p.x - center.x, p.y - center.y, axis.x, axis.y), 0) / arc2.length;

        if (mean1 < mean2) {
            return { negArc: arc1, posArc: arc2 };
        } else {
            return { negArc: arc2, posArc: arc1 };
        }
    }

    /**
     * 二次ベジェ曲線でスムーズなチェーンを追加
     */
    static addSmoothChainQuadratic(path, pts, moveToFirst = true) {
        if (!pts || pts.length === 0) return;

        if (pts.length === 1) {
            if (moveToFirst) path.lineTo(pts[0].x, pts[0].y);
            return;
        }

        // 開始
        if (moveToFirst) path.lineTo(pts[0].x, pts[0].y);

        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i];
            const p1 = pts[i + 1];
            const mx = (p0.x + p1.x) * 0.5;
            const my = (p0.y + p1.y) * 0.5;
            path.quadraticCurveTo(p0.x, p0.y, mx, my);
        }

        // 最後
        const last = pts[pts.length - 1];
        path.lineTo(last.x, last.y);
    }

    /**
     * 外周点からPCA楕円フレームを計算
     * - u1/u2: 主軸（直交）
     * - ax/ay: その方向の半径（外周の最大投影から推定）
     */
    static computeEllipseFrameFromOuterPoints(points, center) {
        // ベクトル(p - center)の共分散
        let sxx = 0, syy = 0, sxy = 0;
        const n = points.length;

        for (const p of points) {
            const x = p.x - center.x;
            const y = p.y - center.y;
            sxx += x * x;
            syy += y * y;
            sxy += x * y;
        }

        sxx /= n;
        syy /= n;
        sxy /= n;

        // 2x2行列 [sxx sxy; sxy syy] の固有値計算
        const tr = sxx + syy;
        const det = sxx * syy - sxy * sxy;
        const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det));
        const l1 = tr / 2 + disc; // 最大固有値

        // l1の固有ベクトル
        let vx, vy;
        const eps = 1e-8;
        if (Math.abs(sxy) > eps) {
            vx = l1 - syy;
            vy = sxy;
        } else {
            // すでに軸整列済みの共分散
            if (sxx >= syy) { vx = 1; vy = 0; }
            else { vx = 0; vy = 1; }
        }

        const u1 = GeometryUtils.normalize(vx, vy);
        const u2 = { x: -u1.y, y: u1.x };

        // 最大投影で半径を推定（ロバスト）
        let ax = 0, ay = 0;
        for (const p of points) {
            const x = p.x - center.x;
            const y = p.y - center.y;
            const a = Math.abs(GeometryUtils.dot(x, y, u1.x, u1.y));
            const b = Math.abs(GeometryUtils.dot(x, y, u2.x, u2.y));
            if (a > ax) ax = a;
            if (b > ay) ay = b;
        }

        // 縮退を防ぐ
        ax = Math.max(ax, 1);
        ay = Math.max(ay, 1);

        return { u1, u2, ax, ay };
    }
}

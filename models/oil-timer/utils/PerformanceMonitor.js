/**
 * FPSとパフォーマンスの監視を行うクラス
 */
export class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
    }

    update(liquidParticles) {
        this.frameCount++;
        const now = performance.now();

        if (now - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
            this.frameCount = 0;
            this.lastTime = now;

            // UIを更新
            this.updateUI(liquidParticles);
        }
    }

    updateUI(liquidParticles) {
        const fpsElement = document.getElementById('fps');
        const particleCountElement = document.getElementById('particleCount');
        const totalSpheres = liquidParticles.reduce((sum, mp) => sum + mp.spheres.length, 0);

        if (fpsElement) fpsElement.textContent = this.fps;
        if (particleCountElement) {
            particleCountElement.textContent = `${liquidParticles.length} (${totalSpheres} 球体)`;
        }
    }

    getFPS() {
        return this.fps;
    }
}

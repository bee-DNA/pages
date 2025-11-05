// 風向箭頭圖層 - 類似 Apple Weather App
class WindLayer {
  constructor(map) {
    this.map = map;
    this.particles = [];
    this.maxParticles = 3000; // 粒子數量
    this.canvas = null;
    this.ctx = null;
    this.animationFrame = null;
    this.isVisible = false;
  }

  // 初始化 Canvas 圖層
  initialize() {
    if (!this.map) return;

    // 創建自定義圖層
    const customLayer = {
      id: "wind-particle-layer",
      type: "custom",

      onAdd: (map, gl) => {
        // 創建 Canvas
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");

        // 設置 Canvas 大小
        const canvas = map.getCanvas();
        this.canvas.width = canvas.width;
        this.canvas.height = canvas.height;

        // 初始化粒子
        this.initParticles();

        // 開始動畫
        this.animate();
      },

      render: (gl, matrix) => {
        if (!this.isVisible || !this.ctx) return;

        // 清空 Canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 繪製風向箭頭
        this.drawWindArrows();
      },

      onRemove: () => {
        if (this.animationFrame) {
          cancelAnimationFrame(this.animationFrame);
        }
      },
    };

    this.map.addLayer(customLayer);
  }

  // 初始化粒子
  initParticles() {
    this.particles = [];
    const canvas = this.map.getCanvas();

    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        age: Math.random() * 100,
        maxAge: 100,
        speed: 1 + Math.random() * 2,
        direction: Math.random() * Math.PI * 2, // 隨機風向
      });
    }
  }

  // 繪製風向箭頭
  drawWindArrows() {
    if (!this.ctx) return;

    const gridSize = 50; // 箭頭間距
    const canvas = this.map.getCanvas();

    for (let x = 0; x < canvas.width; x += gridSize) {
      for (let y = 0; y < canvas.height; y += gridSize) {
        // 獲取該點的風向 (這裡使用模擬數據)
        const windDirection = this.getWindDirection(x, y);
        const windSpeed = this.getWindSpeed(x, y);

        // 繪製箭頭
        this.drawArrow(x, y, windDirection, windSpeed);
      }
    }
  }

  // 繪製單個箭頭
  drawArrow(x, y, direction, speed) {
    if (!this.ctx) return;

    const arrowLength = Math.min(30, speed * 3);
    const arrowWidth = 8;

    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(direction);

    // 箭頭顏色 - 根據風速
    const opacity = Math.min(1, speed / 10);
    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    this.ctx.lineWidth = 2;

    // 繪製箭頭線
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(arrowLength, 0);
    this.ctx.stroke();

    // 繪製箭頭頭部
    this.ctx.beginPath();
    this.ctx.moveTo(arrowLength, 0);
    this.ctx.lineTo(arrowLength - arrowWidth, -arrowWidth / 2);
    this.ctx.lineTo(arrowLength - arrowWidth, arrowWidth / 2);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  // 獲取風向 (模擬數據 - 實際應該從 API 獲取)
  getWindDirection(x, y) {
    // 模擬順時針旋轉的風向
    return (
      Math.atan2(y - this.canvas.height / 2, x - this.canvas.width / 2) +
      Date.now() / 10000
    );
  }

  // 獲取風速 (模擬數據)
  getWindSpeed(x, y) {
    return 5 + Math.sin(x / 100) * 3 + Math.cos(y / 100) * 3;
  }

  // 動畫循環
  animate() {
    if (!this.isVisible) return;

    // 觸發地圖重繪
    this.map.triggerRepaint();

    // 繼續動畫
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  // 顯示/隱藏圖層
  setVisible(visible) {
    this.isVisible = visible;
    if (visible) {
      this.animate();
    } else if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  // 更新粒子位置
  updateParticles() {
    this.particles.forEach((particle) => {
      // 更新位置
      particle.x += Math.cos(particle.direction) * particle.speed;
      particle.y += Math.sin(particle.direction) * particle.speed;

      // 增加年齡
      particle.age++;

      // 重置超出邊界或老化的粒子
      const canvas = this.map.getCanvas();
      if (
        particle.age > particle.maxAge ||
        particle.x < 0 ||
        particle.x > canvas.width ||
        particle.y < 0 ||
        particle.y > canvas.height
      ) {
        particle.x = Math.random() * canvas.width;
        particle.y = Math.random() * canvas.height;
        particle.age = 0;
      }
    });
  }

  // 清理資源
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.map.getLayer("wind-particle-layer")) {
      this.map.removeLayer("wind-particle-layer");
    }
  }
}

export default WindLayer;

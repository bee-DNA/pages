const API_URL = import.meta.env.VITE_API_URL || "https://md2pdf.dpdns.org/bee";

export const api = {
  // API 基礎 URL
  API_URL,

  // 樣本 API
  async getSamples(page = 1, pageSize = 20) {
    const response = await fetch(
      `${API_URL}/api/samples?page=${page}&page_size=${pageSize}`
    );
    if (!response.ok) throw new Error("Failed to fetch samples");
    return response.json();
  },

  async getSample(sampleId) {
    const response = await fetch(`${API_URL}/api/samples/${sampleId}`);
    if (!response.ok) throw new Error("Sample not found");
    return response.json();
  },

  // 氣象 API
  async getWeather(sampleId) {
    const response = await fetch(`${API_URL}/api/weather/${sampleId}`);
    if (!response.ok) throw new Error("Failed to fetch weather data");
    return response.json();
  },

  async getParticles(sampleId, gridSize = 20) {
    const response = await fetch(
      `${API_URL}/api/weather/${sampleId}/particles?grid_size=${gridSize}`
    );
    if (!response.ok) throw new Error("Failed to fetch particle data");
    return response.json();
  },

  // 動畫 API
  async getAnimation(sampleId, start = 0, end = 10) {
    const response = await fetch(
      `${API_URL}/api/animation/${sampleId}?start=${start}&end=${end}`
    );
    if (!response.ok) throw new Error("Failed to fetch animation data");
    return response.json();
  },

  // 系統狀態
  async getSystemStats() {
    const response = await fetch(`${API_URL}/api/system/stats`);
    if (!response.ok) throw new Error("Failed to fetch system stats");
    return response.json();
  },

  // 健康檢查
  async healthCheck() {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) throw new Error("Health check failed");
    return response.json();
  },

  // 配置 API - 獲取後端配置（包含可用日期、時間戳數量等）
  async getConfig() {
    const response = await fetch(`${API_URL}/config`);
    if (!response.ok) throw new Error("Failed to fetch config");
    return response.json();
  },

  // MBTiles 圖磚服務
  async getTileLayers() {
    const response = await fetch(`${API_URL}/tiles`);
    if (!response.ok) throw new Error("Failed to fetch tile layers");
    return response.json();
  },

  async getTileMetadata(layer) {
    const response = await fetch(`${API_URL}/tiles/${layer}/meta/info`);
    if (!response.ok) throw new Error(`Failed to fetch metadata for ${layer}`);
    return response.json();
  },

  async getTileJSON(layer) {
    const response = await fetch(`${API_URL}/tiles/${layer}/meta/tilejson`);
    if (!response.ok) throw new Error(`Failed to fetch TileJSON for ${layer}`);
    return response.json();
  },

  // 圖磚 URL 生成器
  getTileUrl(layer, frame = 0) {
    // frame 從 0 開始，對應到 MBTiles 中的 timestamp_0, timestamp_1, ...
    // 使用新的路由格式: /tiles/:layer/t/:timestamp/:z/:x/:y.png
    return `${API_URL}/tiles/${layer}/t/timestamp_${String(frame).padStart(
      3,
      "0"
    )}/{z}/{x}/{y}.png`;
  },
};

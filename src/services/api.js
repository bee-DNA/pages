// 主 API URL (Go 後端 - 氣象/地圖/圖磚服務)
const API_URL = import.meta.env.VITE_API_URL || "https://md2pdf.dpdns.org/bee";

// 蜜蜂元基因體 API URL (Python 後端 - 樣本查詢/NLP)
const METAGENOMICS_API_URL =
  import.meta.env.VITE_METAGENOMICS_API_URL || "http://localhost:8000";

export const api = {
  // API 基礎 URL
  API_URL,
  METAGENOMICS_API_URL,

  // ==================== 蜜蜂元基因體 API (Python 後端) ====================

  // 自然語言查詢 BioSample 資料
  async queryBioSample(question, useRwkv = true) {
    const response = await fetch(`${METAGENOMICS_API_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, use_rwkv: useRwkv }),
    });
    if (!response.ok) throw new Error("Failed to query biosample data");
    return response.json();
  },

  // 健康檢查 (Python 後端)
  async metagenomicsHealthCheck() {
    const response = await fetch(`${METAGENOMICS_API_URL}/health`);
    if (!response.ok)
      throw new Error("Metagenomics backend health check failed");
    return response.json();
  },

  // 測試端點
  async testCount() {
    const response = await fetch(`${METAGENOMICS_API_URL}/test/count`);
    if (!response.ok) throw new Error("Failed to get count");
    return response.json();
  },

  async testCountry(country) {
    const response = await fetch(
      `${METAGENOMICS_API_URL}/test/country/${encodeURIComponent(country)}`
    );
    if (!response.ok) throw new Error("Failed to get country data");
    return response.json();
  },

  async testSample(sampleId) {
    const response = await fetch(
      `${METAGENOMICS_API_URL}/test/sample/${encodeURIComponent(sampleId)}`
    );
    if (!response.ok) throw new Error("Failed to get sample data");
    return response.json();
  },

  async testGroup(field = "Country") {
    const response = await fetch(
      `${METAGENOMICS_API_URL}/test/group/${encodeURIComponent(field)}`
    );
    if (!response.ok) throw new Error("Failed to get group data");
    return response.json();
  },

  // NLP 測試端點
  async testNlpParse(text) {
    const response = await fetch(`${METAGENOMICS_API_URL}/test/nlp/parse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error("Failed to parse NLP");
    return response.json();
  },

  async getNlpExamples() {
    const response = await fetch(`${METAGENOMICS_API_URL}/test/nlp/examples`);
    if (!response.ok) throw new Error("Failed to get NLP examples");
    return response.json();
  },

  async getCountries() {
    const response = await fetch(`${METAGENOMICS_API_URL}/test/nlp/countries`);
    if (!response.ok) throw new Error("Failed to get countries");
    return response.json();
  },

  async getAntibiotics() {
    const response = await fetch(
      `${METAGENOMICS_API_URL}/test/nlp/antibiotics`
    );
    if (!response.ok) throw new Error("Failed to get antibiotics");
    return response.json();
  },

  // ==================== 原有 API (Go 後端) ====================

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

  // 健康檢查 (Go 後端)
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
    // 使用新的路由格式: /tiles/:layer/t/:timestamp/:z/:x/:y (不帶 .png)
    return `${API_URL}/tiles/${layer}/t/timestamp_${String(frame).padStart(
      3,
      "0"
    )}/{z}/{x}/{y}`;
  },

  // Chat API
  async chat(message) {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error("Failed to send message");
    return response.json();
  },
};

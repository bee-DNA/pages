const API_URL = import.meta.env.VITE_API_URL || "https://md2pdf.dpdns.org/bee";

export const api = {
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
};

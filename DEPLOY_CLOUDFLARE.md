# 前端部署到 Cloudflare Pages 指南

## 📋 概述

前端已在 GitHub: https://github.com/bee-DNA/pages

現在要設定 Cloudflare Pages 自動部署。

---

## 🚀 Cloudflare Pages 部署步驟

### Step 1: 登入 Cloudflare Dashboard

前往：https://dash.cloudflare.com/

### Step 2: 建立 Pages 專案

1. 點選左側 **Workers & Pages**
2. 點選 **Create application**
3. 選擇 **Pages** 標籤
4. 點選 **Connect to Git**

### Step 3: 連接 GitHub 倉庫

1. 選擇 **GitHub**
2. 授權 Cloudflare 訪問您的 GitHub
3. 選擇倉庫：`bee-DNA/pages`
4. 點選 **Begin setup**

### Step 4: 配置建置設定

```
Project name: bee-metagenomics (或您想要的名稱)
Production branch: master
Build command: npm run build
Build output directory: dist
Root directory: (留空，或填入 / )
```

### Step 5: 設定環境變數

在 **Environment variables** 區域添加：

| Variable name    | Value                              | Type       |
|------------------|------------------------------------|------------|
| `VITE_API_URL`   | `https://api.yourdomain.com`       | Plain text |

**⚠️ 重要**: 將 `api.yourdomain.com` 替換成您實際的 Cloudflare Tunnel 域名

### Step 6: 部署

1. 點選 **Save and Deploy**
2. 等待建置完成（約 2-5 分鐘）
3. 建置成功後會得到一個 URL，例如：
   - `https://bee-metagenomics.pages.dev`

### Step 7: 設定自訂域名（可選）

1. 在 Pages 專案頁面，點選 **Custom domains**
2. 點選 **Set up a custom domain**
3. 輸入您的域名（例如：`pages.bee-dna.com`）
4. 按照指示設定 DNS 記錄

---

## 🔧 本地測試

在部署前，先在本地測試：

```bash
cd d:\OneDrive\學校上課\課程\四上\bioailab\bee_metagenomics\frontend

# 安裝依賴
npm install

# 開發模式（使用本地後端）
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

---

## 📝 更新前端環境變數

### 方法 1: 透過 Cloudflare Dashboard

1. 進入您的 Pages 專案
2. 點選 **Settings** > **Environment variables**
3. 編輯 `VITE_API_URL`
4. 點選 **Save**
5. 重新部署（**Deployments** > **Retry deployment**）

### 方法 2: 透過 wrangler.toml

在 `frontend/wrangler.toml` 中設定：

```toml
name = "bee-metagenomics"
compatibility_date = "2024-11-06"

[env.production.vars]
VITE_API_URL = "https://api.yourdomain.com"
```

---

## 🌐 完整架構

```
使用者瀏覽器
    ↓ HTTPS
[Cloudflare Pages - 前端]
https://bee-metagenomics.pages.dev
    ↓ API 請求
    ↓ HTTPS
[Cloudflare Tunnel]
    ↓
[Pi - Docker 容器]
├── Nginx (地圖切片)
├── md2pdf (8000)
└── bee-backend (8001)
```

---

## ✅ 部署後測試

### 1. 訪問前端
```
https://bee-metagenomics.pages.dev
```

### 2. 測試 API 連接

在瀏覽器控制台（F12）執行：

```javascript
// 測試健康檢查
fetch('https://api.yourdomain.com/health')
  .then(r => r.json())
  .then(console.log)

// 測試樣本列表
fetch('https://api.yourdomain.com/api/samples')
  .then(r => r.json())
  .then(console.log)

// 測試氣象資料
fetch('https://api.yourdomain.com/api/weather/example-ncue')
  .then(r => r.json())
  .then(console.log)
```

### 3. 檢查環境變數

在前端代碼中添加：

```javascript
console.log('API URL:', import.meta.env.VITE_API_URL)
```

---

## 🔄 自動部署

Cloudflare Pages 會自動：

1. **監聽 GitHub push**：推送到 `master` 分支時自動建置
2. **預覽部署**：Pull Request 會建立預覽環境
3. **回滾**：可快速回滾到之前的版本

### 手動觸發部署

```bash
cd frontend
git add .
git commit -m "Update frontend"
git push origin master
```

Cloudflare Pages 會自動偵測並開始建置。

---

## 🐛 常見問題

### Q1: 建置失敗 - "npm not found"

**解決**: Cloudflare Pages 預設已安裝 npm，檢查 `package.json` 是否正確。

### Q2: API 請求 CORS 錯誤

**解決**: 確認後端 `.env` 中的 `CORS_ORIGINS` 包含前端域名：

```env
CORS_ORIGINS=https://bee-metagenomics.pages.dev,https://pages.bee-dna.com
```

### Q3: 環境變數未生效

**解決**: 
1. 確認變數名稱有 `VITE_` 前綴
2. 修改後需要重新部署
3. 清除瀏覽器快取

### Q4: 404 錯誤（找不到頁面）

**解決**: 在 `public/` 目錄添加 `_redirects` 文件：

```
/*    /index.html   200
```

---

## 📊 監控和分析

### Cloudflare Analytics

在 Pages 專案中查看：
- 訪問量
- 建置歷史
- 錯誤日誌
- 效能指標

### Web Analytics（可選）

在 Cloudflare Dashboard 啟用 Web Analytics 獲得更詳細的分析。

---

## 🔒 安全設定

### 1. Access Control（可選）

限制訪問：
1. 進入 **Settings** > **Access Policy**
2. 設定密碼保護或 Cloudflare Access

### 2. CORS 設定

確保後端 CORS 只允許您的域名：

```env
CORS_ORIGINS=https://bee-metagenomics.pages.dev
```

---

## 📈 效能優化

### 1. 啟用 Cloudflare CDN

Cloudflare Pages 自動使用全球 CDN。

### 2. 建置優化

在 `vite.config.js` 中：

```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material'],
          'map-vendor': ['mapbox-gl'],
        }
      }
    }
  }
})
```

### 3. 圖片優化

使用 Cloudflare Images 或 WebP 格式。

---

## ✅ 部署檢查清單

- [ ] GitHub 倉庫已連接
- [ ] 建置設定正確（`npm run build` -> `dist`）
- [ ] 環境變數 `VITE_API_URL` 已設定
- [ ] 首次部署成功
- [ ] 前端可訪問
- [ ] API 連接正常
- [ ] CORS 無錯誤
- [ ] 地圖顯示正常
- [ ] 氣象資料載入成功
- [ ] 自訂域名設定完成（可選）

---

## 🆘 需要幫助？

- Cloudflare Pages 文檔：https://developers.cloudflare.com/pages
- Vite 文檔：https://vitejs.dev/guide
- 檢查建置日誌：Cloudflare Dashboard > Pages > Deployments

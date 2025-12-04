# Bee Metagenomics - Frontend

蜜蜂宏基因體分析平台的前端應用程式

## 📋 專案簡介

這是一個基於 React 的生物資訊學分析平台，提供多種基因體數據分析和視覺化工具。

## 🚀 技術棧

- **框架**: React 18 + Vite
- **UI 框架**: Material-UI (MUI)
- **路由**: React Router v6
- **國際化**: i18next + react-i18next
- **部署平台**: Cloudflare Pages

## 📁 專案結構

```
frontend/
├── src/
│   ├── assets/          # 靜態資源 (圖片、SVG 等)
│   ├── components/      # 共用組件
│   │   ├── Navbar.jsx   # 導航欄組件
│   │   └── ResistanceTable.jsx  # 抗藥性表格
│   ├── pages/           # 頁面組件
│   │   ├── Home.jsx
│   │   ├── Query.jsx
│   │   ├── Search.jsx
│   │   ├── Heatmap.jsx
│   │   ├── ComplexHeatmap.jsx
│   │   ├── Map.jsx
│   │   └── CgMLST.jsx
│   ├── i18n/            # 國際化設定
│   │   └── config.js
│   ├── App.jsx          # 主應用程式組件
│   └── main.jsx         # 應用程式入口
├── public/              # 公開靜態資源與數據
│   ├── query-data/      # Query 頁面數據
│   ├── search-data/     # Search 頁面數據
│   ├── heatmap-data/    # Heatmap 頁面數據
│   ├── complex-heatmap-data/  # ComplexHeatmap 頁面數據
│   ├── map-data/        # Map 頁面數據
│   └── cgmlst-data/     # cgMLST 頁面數據
└── package.json
```

## 🌐 功能模組

### 導航頁面

- **Query (查詢)** - 基因序列查詢功能
- **Search (搜尋)** - 數據搜尋與過濾
- **Heatmap (熱力圖)** - 基因表達熱力圖視覺化
- **ComplexHeatmap (複雜熱力圖)** - 進階熱力圖分析
- **Map (地圖)** - 地理分布視覺化
- **cgMLST** - 核心基因多位點序列分型分析

### 多語言支援

- 預設語言: 英文 (English)
- 支援語言: 英文、繁體中文
- 一鍵切換語言，界面自動調整寬度避免扭曲

## 🛠️ 開發指令

### 安裝依賴

```bash
npm install
```

### 啟動開發伺服器

```bash
npm run dev
```

開發伺服器將在 `http://localhost:5173` 啟動

### 建置生產版本

```bash
npm run build
```

### 預覽生產版本

```bash
npm run preview
```

## 🔧 環境變數

創建 `.env.local` 文件來設定環境變數：

```env
# Go 後端 API URL (氣象/地圖/圖磚服務)
VITE_API_URL=https://md2pdf.dpdns.org/bee

# Python 後端 API URL (聊天/樣本查詢/NLP)
VITE_METAGENOMICS_API_URL=https://md2pdf.dpdns.org/beeback
```

## 📦 部署

### Cloudflare Pages 自動部署

1. 推送代碼到 GitHub `main` 分支
2. Cloudflare Pages 自動觸發建置和部署
3. 建置指令: `npm run build`
4. 輸出目錄: `dist`

### 開發流程

- **develop 分支**: 日常開發和小存檔
- **main 分支**: 正式發布版本
- 確認無誤後，將 develop 合併到 main 觸發自動部署

## 🎨 設計特色

- **響應式設計**: 適配各種螢幕尺寸
- **Material Design**: 使用 Google Material-UI 設計系統
- **流暢動畫**: 頁面切換和交互動畫
- **語言自適應**: 中英文切換時界面寬度自動調整

## 📝 更新日誌

### 2025-11-05

#### 初始設置

- ✅ 初始化專案 (Vite + React)
- ✅ 安裝 Material-UI 和 React Router
- ✅ 建立導航欄組件 (Navbar)
- ✅ 建立六個功能頁面 (Query, Search, Heatmap, ComplexHeatmap, Map, cgMLST)
- ✅ 整合 i18next 國際化支援
- ✅ 添加語言切換功能
- ✅ 設定路由系統

#### 導航欄優化

- ✅ 修正標題 "Bee Metagenomics" 保持英文不翻譯
- ✅ 統一導航按鈕寬度 (115px)，避免語言切換時大小變化
- ✅ 修復語言切換圖標顯示問題
- ✅ 優化按鈕懸停效果和選中狀態
- ✅ 緊湊化按鈕間距和大小

#### Query 頁面功能

- ✅ 建立抗生素抗藥性基因表格組件 (ResistanceTable)
- ✅ 支援 28 種抗生素分類顯示
- ✅ 垂直顯示抗生素名稱（節省空間）
- ✅ Sticky header 和 sticky 左側欄（方便瀏覽大表格）
- ✅ 分組顏色標示（8 個抗生素分組）
- ✅ 響應式設計，支援橫向和縱向滾動
- ✅ CSV 下載功能
- ✅ 從本地 JSON 文件載入數據
- ✅ 顯示任務信息（Job ID, Genome File, Taxonomy）
- ✅ 載入狀態和錯誤處理

#### 數據管理

- ✅ 每個頁面有獨立的數據資料夾
  - `public/query-data/` - Query 頁面數據
  - `public/search-data/` - Search 頁面數據
  - `public/heatmap-data/` - Heatmap 頁面數據
  - `public/complex-heatmap-data/` - ComplexHeatmap 頁面數據
  - `public/map-data/` - Map 頁面數據
  - `public/cgmlst-data/` - cgMLST 頁面數據
- ✅ 所有數據隨前端一起部署到 Cloudflare Pages
- ✅ 支援 JSON 格式數據
- ✅ 提供範例數據和模板
- ✅ 修改數據後推送 GitHub 自動部署

## 🔗 相關連結

- Go 後端 API (氣象/地圖): https://md2pdf.dpdns.org/bee
- Python 後端 API (聊天/NLP): https://md2pdf.dpdns.org/beeback
- GitHub 倉庫: https://github.com/bee-DNA/pages

## 📄 授權

此專案為學術研究用途。

# Cloudflare Pages 部署指南

## 🚀 部署設定

### 建置設定
- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`

### 環境變數
無需特殊環境變數（API URL 已硬編碼在程式碼中）

## 📦 新增功能

### 1. 資料模式選擇器 (DataModeSelector)
位置：地圖頂部控制列，"Today's Data" 和 "🗺️ Street" 之間

三個按鈕：
- **即時**: 切換到即時 OpenWeather 資料
- **搜尋**: 開啟樣本搜尋對話框
- **日期**: 開啟日期選擇器

### 2. 樣本搜尋 (SampleSearchDialog)
- 輸入樣本 ID (EB0001, EB0002)
- 自動導航到對應日期的歷史資料
- 映射關係:
  - EB0001 → 2024-11-01
  - EB0002 → 2024-11-02

### 3. 日期選擇器 (DatePickerDialog)
- MUI DatePicker 整合
- 只能選擇有資料的日期（灰色禁用其他日期）
- 目前支援: 2024-11-01, 2024-11-02

### 4. 時間軸控制器 (TimelineControls)
- 僅在歷史資料模式顯示
- 16 幀動畫（2 天 × 8 時間點）
- 5 秒完整循環
- 控制項：播放/暫停/停止/上一幀/下一幀/滑桿

### 5. 雙模式地圖圖層
- **即時模式**: OpenWeather Tile API
- **歷史模式**: Raspberry Pi MBTiles API
  - 溫度: `/tiles/temperature/{z}/{x}/{y}.png`
  - 降雨: `/tiles/precipitation/{z}/{x}/{y}.png`
  - 風場: `/tiles/wind/{z}/{x}/{y}.png`
  - 雲層: `/tiles/clouds/{z}/{x}/{y}.png`
  - 氣壓: `/tiles/pressure/{z}/{x}/{y}.png`

## 🔧 技術架構

### 新增依賴
```json
{
  "@mui/x-date-pickers": "^7.x.x",
  "dayjs": "^1.11.x"
}
```

### 新增檔案
- `src/components/DataModeSelector.jsx` - 模式選擇器
- `src/components/SampleSearchDialog.jsx` - 樣本搜尋對話框
- `src/components/DatePickerDialog.jsx` - 日期選擇器
- `src/components/TimelineControls.jsx` - 動畫控制器
- `src/hooks/useTimelineAnimation.js` - 動畫邏輯 Hook

### 修改檔案
- `src/pages/Map.jsx` - 整合雙模式、對話框、動畫
- `src/services/api.js` - 新增 MBTiles API 方法
- `package.json` - 新增依賴

## 📱 使用流程

1. **查看即時資料**
   - 預設模式，顯示當前 OpenWeather 資料
   - 可切換圖層（溫度、降雨、風場等）

2. **搜尋樣本歷史資料**
   - 點擊 "搜尋" 按鈕
   - 輸入樣本 ID (例如: EB0001)
   - 自動載入該日期的歷史資料並開始動畫

3. **選擇日期查看**
   - 點擊 "日期" 按鈕
   - 從日曆選擇有資料的日期
   - 載入該日期的 8 個時間點資料

4. **控制動畫**
   - 使用底部時間軸控制器
   - 播放/暫停循環動畫
   - 手動滑動到特定時間點

## 🌐 Backend API

### Raspberry Pi MBTiles 伺服器
- **URL**: https://md2pdf.dpdns.org/bee
- **端點**:
  - `GET /tiles` - 列出可用圖層
  - `GET /tiles/{layer}/metadata` - 取得圖層元資料
  - `GET /tiles/{layer}/tilejson` - 取得 TileJSON 規格
  - `GET /tiles/{layer}/{z}/{x}/{y}.png` - 取得圖磚

### 資料來源
- **即時**: OpenWeather Tile API
- **歷史**: ERA5 → GeoTIFF → MBTiles (存放於 Raspberry Pi)

## ✅ 部署檢查清單

- [x] 所有元件無語法錯誤
- [x] 依賴已安裝並更新 package.json
- [x] Git commit 包含所有變更
- [x] 推送到 GitHub master 分支
- [ ] Cloudflare Pages 自動部署
- [ ] 測試所有功能（即時、搜尋、日期、動畫）
- [ ] 確認 Raspberry Pi API 可訪問

## 🔗 相關資源

- Frontend Repo: https://github.com/bee-DNA/pages
- Backend API: https://md2pdf.dpdns.org/bee
- Cloudflare Pages: 自動從 GitHub 部署

## 📝 已知限制

1. **MBTiles 資料**
   - 目前為 placeholder 模式（20 KB SQLite 檔案）
   - 無實際圖磚資料，返回 HTTP 204
   - 需要執行 Script 04 生成真實圖磚

2. **支援日期**
   - 僅 2024-11-01 和 2024-11-02
   - 需擴展資料處理 pipeline 以增加更多日期

3. **樣本映射**
   - 目前只有 EB0001, EB0002
   - 需擴展到 900 個樣本時需更新映射邏輯

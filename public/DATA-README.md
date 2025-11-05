# Bee Metagenomics - 數據資料夾總覽

所有頁面的數據都存放在 `public/` 目錄下，會隨著前端一起部署到 Cloudflare Pages。

## 📁 資料夾結構

```
public/
├── query-data/              # Query 頁面 - 抗藥性基因查詢
│   ├── sample-resistance-data.json
│   ├── template.json
│   └── README.md
│
├── search-data/             # Search 頁面 - 數據搜尋
│   └── README.md
│
├── heatmap-data/            # Heatmap 頁面 - 熱力圖
│   └── README.md
│
├── complex-heatmap-data/    # ComplexHeatmap 頁面 - 複雜熱力圖
│   └── README.md
│
├── map-data/                # Map 頁面 - 地圖視覺化
│   └── README.md
│
└── cgmlst-data/             # cgMLST 頁面 - 基因分型
    └── README.md
```

## 🚀 使用方式

### 1. 添加數據

將數據文件（JSON 格式）放入對應的資料夾：

- Query 頁面 → `query-data/`
- Search 頁面 → `search-data/`
- Heatmap 頁面 → `heatmap-data/`
- 其他頁面以此類推

### 2. 在組件中引用

```javascript
// 例如在 Query 頁面
const response = await fetch("/query-data/你的文件.json");
```

### 3. 部署到 Cloudflare Pages

1. 提交修改到 Git
2. 推送到 GitHub main 分支
3. Cloudflare Pages 自動建置和部署
4. 所有數據資料夾都會一起部署

## ⚙️ Cloudflare Pages 設定

- **建置指令**: `npm run build`
- **輸出目錄**: `dist`
- **環境變數**: 無需額外設定
- **數據文件**: 會自動複製到 `dist/` 目錄

## 📝 數據格式建議

每個頁面可以有自己的數據格式，但建議：

- 使用 JSON 格式
- 文件名清楚描述內容
- 保持數據結構一致
- 添加註釋文檔

## 🔄 開發流程

1. **本地開發**

   - 在對應資料夾添加/修改數據
   - `npm run dev` 啟動開發伺服器
   - 即時查看效果

2. **推送到 develop 分支**

   - 小修改、測試階段使用
   - 不觸發自動部署

3. **合併到 main 分支**
   - 確認無誤後合併
   - 自動觸發 Cloudflare Pages 部署

## 💡 最佳實踐

1. **數據大小**

   - 單個 JSON 文件建議 < 5MB
   - 大數據考慮分割成多個文件

2. **命名規範**

   - 使用小寫和連字號：`my-data.json`
   - 避免空格和特殊字元

3. **版本控制**

   - 數據文件加入 Git 版本控制
   - 可以追蹤歷史變更

4. **共用數據**
   - 如果多個頁面共用數據
   - 可以建立 `shared-data/` 資料夾
   - 或在各自資料夾中建立符號連結

## 🔗 相關文檔

- [Query 頁面數據說明](./query-data/README.md)
- [前端 README](../README.md)
- [後端 README](../../backend/README.md)

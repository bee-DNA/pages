# Query 頁面數據

此資料夾存放 Query 頁面的抗藥性基因數據。

## 📁 數據文件

- `sample-resistance-data.json` - 範例數據
- `template.json` - 空白模板
- 可添加更多 `.json` 文件

## 📝 數據格式

```json
{
  "jobId": "任務ID",
  "genomeFile": "基因體文件名稱",
  "taxonomy": "物種分類",
  "genes": [
    {
      "gene": "基因名稱",
      "identity": 95.35,
      "resistances": ["抗生素1", "抗生素2"]
    }
  ]
}
```

## 🔗 Cloudflare Pages 部署

此資料夾會隨著前端一起部署到 Cloudflare Pages。
修改文件後，推送到 GitHub main 分支即可自動更新。

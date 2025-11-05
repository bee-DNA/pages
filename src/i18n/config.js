import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 翻譯資源
const resources = {
  en: {
    translation: {
      // 導航欄
      nav: {
        query: "Query",
        search: "Search",
        heatmap: "Heatmap",
        complexHeatmap: "ComplexHeatmap",
        map: "Map",
        cgMLST: "cgMLST",
      },
      // 頁面標題
      title: "Bee Metagenomics",
      subtitle: "Bioinformatics Analysis Platform",
      // 其他通用翻譯
      common: {
        loading: "Loading...",
        error: "Error",
        success: "Success",
        submit: "Submit",
        cancel: "Cancel",
        search: "Search",
        clear: "Clear",
        download: "Download",
        upload: "Upload",
      },
      // Query 頁面
      query: {
        title: "Resistance genes & Antibiotics",
        gene: "Gene",
        identity: "Identity (%)",
        resistanceGene: "Resistance gene",
        noData: "No data available. Please add data file to public/query-data/",
      },
    },
  },
  zh: {
    translation: {
      // 導航欄
      nav: {
        query: "查詢",
        search: "搜尋",
        heatmap: "熱力圖",
        complexHeatmap: "複雜熱力圖",
        map: "地圖",
        cgMLST: "cgMLST",
      },
      // 頁面標題
      title: "Bee Metagenomics",
      subtitle: "生物資訊分析平台",
      // 其他通用翻譯
      common: {
        loading: "載入中...",
        error: "錯誤",
        success: "成功",
        submit: "提交",
        cancel: "取消",
        search: "搜尋",
        clear: "清除",
        download: "下載",
        upload: "上傳",
      },
      // Query 頁面
      query: {
        title: "抗藥性基因與抗生素",
        gene: "基因",
        identity: "相似度 (%)",
        resistanceGene: "抗藥性基因",
        noData: "無可用數據。請將數據文件添加到 public/query-data/",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // 預設語言為英文
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

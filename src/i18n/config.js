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
      // Map 頁面
      map: {
        title: "Map",
        subtitle: "Ocean & Meteorological Data",
        todayData: "Today's Data",
        historicalData: "Historical Data",
        noDateSelected: "No Date Selected",
        dataMode: {
          live: "Live",
          search: "Search",
          date: "Date",
        },
        mapStyle: {
          street: "Street",
          satellite: "Satellite",
        },
        layers: "Layers",
        layerNames: {
          temperature: "Temperature",
          precipitation: "Precipitation",
          wind: "Wind Speed",
          clouds: "Clouds",
          pressure: "Pressure",
        },
        legend: {
          cold: "Cold",
          hot: "Hot",
        },
        marker: {
          demoPoint: "Demo Sampling Point",
          layersEnabled: "Temperature layers enabled",
        },
        dialog: {
          searchTitle: "Search by Sample ID",
          datePickerTitle: "Select Historical Date",
          sampleId: "Sample ID",
          selectSample: "Select Sample",
          selectDate: "Select Date",
          confirm: "Confirm",
          cancel: "Cancel",
        },
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
      // Map 頁面
      map: {
        title: "地圖",
        subtitle: "海洋與氣象資料",
        todayData: "今日資料",
        historicalData: "歷史資料",
        noDateSelected: "未選擇日期",
        dataMode: {
          live: "即時",
          search: "搜尋",
          date: "日期",
        },
        mapStyle: {
          street: "街道",
          satellite: "衛星",
        },
        layers: "圖層",
        layerNames: {
          temperature: "全球溫度",
          precipitation: "降水分布",
          wind: "風速風向",
          clouds: "雲層",
          pressure: "氣壓",
        },
        legend: {
          cold: "低溫",
          hot: "高溫",
        },
        marker: {
          demoPoint: "示範採樣點",
          layersEnabled: "溫度圖層已啟用",
        },
        dialog: {
          searchTitle: "依樣本編號搜尋",
          datePickerTitle: "選擇歷史日期",
          sampleId: "樣本編號",
          selectSample: "選擇樣本",
          selectDate: "選擇日期",
          confirm: "確認",
          cancel: "取消",
        },
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

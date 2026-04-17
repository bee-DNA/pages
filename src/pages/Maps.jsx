import { useEffect, useRef, useState, useMemo } from "react";
import { Container, Box, Typography } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTranslation } from "react-i18next";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

// Mapbox Access Token
mapboxgl.accessToken =
  "pk.eyJ1IjoiYmVlLWRuYSIsImEiOiJjbWZ5MTlhOTkwZnF3MmxvbjkwN2RtM2Z4In0.yFiY2MNpWqaDINuLaz1e0w";

const Maps = () => {
  const { t } = useTranslation();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng] = useState(120.5377);
  const [lat] = useState(24.0513);
  const [zoom] = useState(2);
  const [mapStyle, setMapStyle] = useState("streets");
  const [isInitialized, setIsInitialized] = useState(false);
  const markersRef = useRef([]);

  // BioSample 資料
  const [biosampleData, setBiosampleData] = useState([]);
  const [countryStats, setCountryStats] = useState([]);

  // 年份篩選
  const [startYear, setStartYear] = useState(null);
  const [endYear, setEndYear] = useState(null);

  // 解析經緯度字串 (例如: "24.34 N 123.91 E")
  const parseLatLon = (latLonStr) => {
    if (!latLonStr) return null;

    try {
      const parts = latLonStr.trim().split(/\s+/);
      if (parts.length < 4) return null;

      let lat = parseFloat(parts[0]);
      let lng = parseFloat(parts[2]);

      if (parts[1].toUpperCase() === "S") lat = -lat;
      if (parts[3].toUpperCase() === "W") lng = -lng;

      return { lat, lng };
    } catch (error) {
      return null;
    }
  };

  // 從 collection_date 提取年份
  const extractYear = (dateStr) => {
    if (!dateStr) return null;
    // 處理 "2011-10-09" 或 "2011" 格式
    const yearMatch = dateStr.match(/^(\d{4})/);
    return yearMatch ? parseInt(yearMatch[1], 10) : null;
  };

  // 處理國家統計資料（支援年份篩選）
  const processCountryStats = (data, filterStartYear, filterEndYear) => {
    console.log("📊 開始處理國家統計資料...", `總共 ${data.length} 筆`);
    console.log(
      `📅 篩選條件: ${filterStartYear || "無"} ~ ${filterEndYear || "無"}`
    );
    const countryMap = new Map();

    data.forEach((item) => {
      // 檢查 collection_date - 沒有日期的資料一律排除
      const year = extractYear(item.collection_date);
      if (year === null) return;

      // 年份篩選
      if (filterStartYear && year < filterStartYear) return;
      if (filterEndYear && year > filterEndYear) return;

      let country = null;
      let coords = null;

      // 提取國家名稱
      if (item.geo_loc_name) {
        country = item.geo_loc_name.split(":")[0].trim();
      } else if (item["geographic location (country and/or sea)"]) {
        country = item["geographic location (country and/or sea)"].trim();
      }

      // 解析座標
      if (item.lat_lon) {
        coords = parseLatLon(item.lat_lon);
      } else if (
        item["geographic location (latitude)"] &&
        item["geographic location (longitude)"]
      ) {
        coords = {
          lat: parseFloat(item["geographic location (latitude)"]),
          lng: parseFloat(item["geographic location (longitude)"]),
        };
      }

      // 只處理有國家和座標的資料
      if (country && coords && !isNaN(coords.lat) && !isNaN(coords.lng)) {
        if (!countryMap.has(country)) {
          countryMap.set(country, {
            country,
            count: 0,
            coords: coords,
            samples: [],
          });
        }

        const countryData = countryMap.get(country);
        countryData.count += 1;
        countryData.samples.push(item);
      }
    });

    const stats = Array.from(countryMap.values()).sort(
      (a, b) => b.count - a.count
    );
    console.log(`✅ 處理完成: 找到 ${stats.length} 個國家`);
    console.log(
      "前5個國家:",
      stats.slice(0, 5).map((s) => `${s.country}: ${s.count}`)
    );
    setCountryStats(stats);
  };

  // 載入 BioSample 資料
  useEffect(() => {
    const loadBiosampleData = async () => {
      try {
        console.log("📥 開始載入 BioSample 資料...");
        const response = await fetch("/biosample_enhanced.json");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ 成功載入 ${data.length} 筆 BioSample 資料`);
        setBiosampleData(data);
        processCountryStats(data, null, null);
      } catch (error) {
        console.error("❌ 載入 BioSample 資料失敗:", error);
      }
    };

    loadBiosampleData();
  }, []);

  // 當年份篩選變更時重新計算統計
  useEffect(() => {
    if (biosampleData.length > 0) {
      const filterStart = startYear ? startYear.year() : null;
      const filterEnd = endYear ? endYear.year() : null;
      processCountryStats(biosampleData, filterStart, filterEnd);
    }
  }, [startYear, endYear]);

  // 顯示標記
  const displayMarkers = () => {
    if (!map.current || countryStats.length === 0) {
      console.log("⏳ 地圖或資料尚未準備好");
      return;
    }

    // 清除舊標記
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    console.log(`🗺️ 開始顯示 ${countryStats.length} 個國家標記`);

    countryStats.forEach((countryData) => {
      const { country, count, coords } = countryData;

      // 建立外層容器 - 固定尺寸避免重新定位
      const el = document.createElement("div");
      el.className = "country-marker-container";
      el.style.cssText = `
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      `;

      // 建立內層標記元素 - 實際顯示的圓圈
      const markerEl = document.createElement("div");
      markerEl.className = "country-marker";
      markerEl.style.cssText = `
        width: 40px;
        height: 40px;
        background-color: #1976d2;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 14px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: all 0.2s ease;
        pointer-events: auto;
      `;
      markerEl.textContent = count;

      // 懸停效果 - 只改變內層元素樣式，不影響外層定位
      markerEl.addEventListener("mouseenter", () => {
        markerEl.style.width = "46px";
        markerEl.style.height = "46px";
        markerEl.style.fontSize = "16px";
        markerEl.style.boxShadow = "0 4px 16px rgba(0,0,0,0.5)";
        markerEl.style.borderWidth = "4px";
      });
      markerEl.addEventListener("mouseleave", () => {
        markerEl.style.width = "40px";
        markerEl.style.height = "40px";
        markerEl.style.fontSize = "14px";
        markerEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
        markerEl.style.borderWidth = "3px";
      });

      el.appendChild(markerEl);

      // Popup 內容
      const popupContent = `
        <div style="font-family: sans-serif; padding: 12px; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <div style="width: 40px; height: 40px; background: #1976d2; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; font-weight: 700;">
              ${count}
            </div>
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #1a1a1a;">${country}</h3>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">BioSample Count</p>
            </div>
          </div>
        </div>
      `;

      // 建立並加入標記 - 禁用拖拽
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: "center",
        draggable: false, // 禁用拖拽
      })
        .setLngLat([coords.lng, coords.lat])
        .setPopup(
          new mapboxgl.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: false,
            maxWidth: "300px",
          }).setHTML(popupContent)
        )
        .addTo(map.current);

      markersRef.current.push(marker);
    });

    console.log(`✅ 已加入 ${markersRef.current.length} 個標記`);
  };

  // 當資料更新時顯示標記
  useEffect(() => {
    if (isInitialized && countryStats.length > 0) {
      displayMarkers();
    }
  }, [countryStats, isInitialized]);

  useEffect(() => {
    if (map.current) return; // 避免重複初始化

    console.log("🗺️ 初始化地圖...");

    // 初始化地圖 - 優化性能設定
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
      minZoom: 1.5,
      // 性能優化設定
      antialias: false, // 關閉抗鋸齒以提升性能
      refreshExpiredTiles: false, // 不自動刷新過期圖磚
      maxTileCacheSize: 50, // 減少圖磚快取大小
      preserveDrawingBuffer: false, // 不保留繪圖緩衝
      fadeDuration: 100, // 減少淡入淡出時間（預設300ms）
    });

    // 添加導航控制
    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    // 添加比例尺
    map.current.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: "metric",
      }),
      "bottom-left"
    );

    // 地圖載入完成
    map.current.on("load", () => {
      console.log("✅ 地圖載入完成");
      setIsInitialized(true);
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [lng, lat, zoom]);

  return (
    <Container maxWidth={false} disableGutters sx={{ py: 4, px: 3 }}>
      <Box sx={{ width: "100%" }}>
        {/* 頁面標題區 */}
        <Box
          sx={{
            mb: 3,
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "16px 20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* 左側：標題（點擊可重置篩選） */}
          <Box
            onClick={() => {
              setStartYear(null);
              setEndYear(null);
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              cursor: "pointer",
              padding: "4px 8px",
              marginLeft: "-8px",
              borderRadius: "8px",
              transition: "background-color 0.2s",
              "&:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.08)",
              },
            }}
          >
            <Box
              sx={{
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MapIcon sx={{ fontSize: 28, color: "#1976d2" }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#1976d2",
                  lineHeight: 1.2,
                }}
              >
                {t("map.title")}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#999", fontSize: "11px" }}
              >
                BioSample Geographic Distribution
              </Typography>
            </Box>
          </Box>

          {/* 右側：年份篩選 */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <DatePicker
                label="Start Year"
                views={["year"]}
                value={startYear}
                onChange={(newValue) => setStartYear(newValue)}
                maxDate={endYear || undefined}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      width: 130,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#f5f5f5",
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: "13px",
                      },
                      "& .MuiOutlinedInput-input": {
                        fontSize: "13px",
                        padding: "8px 12px",
                      },
                    },
                  },
                }}
              />
              <Typography sx={{ color: "#666", fontSize: "14px" }}>
                ~
              </Typography>
              <DatePicker
                label="End Year"
                views={["year"]}
                value={endYear}
                onChange={(newValue) => setEndYear(newValue)}
                minDate={startYear || undefined}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      width: 130,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#f5f5f5",
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: "13px",
                      },
                      "& .MuiOutlinedInput-input": {
                        fontSize: "13px",
                        padding: "8px 12px",
                      },
                    },
                  },
                }}
              />
            </Box>
          </LocalizationProvider>
        </Box>

        {/* 地圖容器 */}
        <Box sx={{ position: "relative", width: "100%" }}>
          <Box
            ref={mapContainer}
            sx={{
              width: "100%",
              height: "calc(100vh - 250px)",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              border: "2px solid #e0e0e0",
            }}
          />

          {/* 資料統計面板 - 隱藏 */}
          <Box
            sx={{
              display: "none",
              position: "absolute",
              top: "16px",
              left: "16px",
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "12px 16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              minWidth: "150px",
              zIndex: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: "#333",
                marginBottom: "8px",
                fontSize: "13px",
              }}
            >
              Statistics
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Typography sx={{ fontSize: "11px", color: "#666" }}>
                Countries: <strong>{countryStats.length}</strong>
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#666" }}>
                Total Samples: <strong>{biosampleData.length}</strong>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Maps;

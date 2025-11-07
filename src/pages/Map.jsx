import { useEffect, useRef, useState } from "react";
import { Container, Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import TimeController from "../components/TimeController";
import LayerControl from "../components/LayerControl";
import { api } from "../services/api";

// Mapbox Access Token
mapboxgl.accessToken =
  "pk.eyJ1IjoiYmVlLWRuYSIsImEiOiJjbWZ5MTlhOTkwZnF3MmxvbjkwN2RtM2Z4In0.yFiY2MNpWqaDINuLaz1e0w";

const Map = () => {
  const { t, i18n } = useTranslation();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng] = useState(120.5377); // 彰化師範大學經度
  const [lat] = useState(24.0513); // 彰化師範大學緯度
  const [zoom] = useState(2); // 全球視圖
  const [mapStyle, setMapStyle] = useState("streets"); // streets | satellite
  const layersRef = useRef(null); // 保存當前圖層狀態
  const addWeatherLayersRef = useRef(null); // 保存 addWeatherLayers 函數引用

  // 添加所有氣象圖層的函數
  const addWeatherLayers = () => {
    if (!map.current) {
      console.log("❌ map.current 不存在");
      return;
    }

    // 等待地圖樣式完全載入
    if (!map.current.isStyleLoaded()) {
      console.log("⏳ 等待地圖樣式載入...");
      map.current.once("styledata", () => {
        if (addWeatherLayersRef.current) {
          addWeatherLayersRef.current();
        }
      });
      return;
    }

    console.log("🔄 開始添加氣象圖層...");

    // 檢查並移除舊圖層
    const layerIds = [
      "sst-layer",
      "lst-layer",
      "wind-layer",
      "wind-arrow-layer",
      "waves-layer",
      "chlorophyll-layer",
    ];
    layerIds.forEach((id) => {
      if (map.current.getLayer(id)) {
        map.current.removeLayer(id);
      }
    });

    // 檢查並移除舊資料源
    const sourceIds = [
      "openweather-temp",
      "openweather-precipitation",
      "openweather-wind",
      "wind-arrows",
      "openweather-clouds",
      "openweather-pressure",
    ];
    sourceIds.forEach((id) => {
      if (map.current.getSource(id)) {
        map.current.removeSource(id);
      }
    });

    // 溫度圖層 - 超高飽和度
    try {
      map.current.addSource("openweather-temp", {
        type: "raster",
        tiles: [
          `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=c3021b469b0ad866b2e96b3e5676347f`,
        ],
        tileSize: 256,
      });

      map.current.addLayer({
        id: "sst-layer",
        type: "raster",
        source: "openweather-temp",
        paint: {
          "raster-opacity": 0.8,
          "raster-brightness-min": 0.15,
          "raster-brightness-max": 1.0, // 最大值為1
          "raster-contrast": 1.0, // 最大對比度
          "raster-saturation": 1.0, // 最大飽和度 (最大值為1)
        },
        layout: {
          visibility: "visible", // 默認顯示
        },
      });
      console.log("✅ 溫度圖層已添加 (visible)");
    } catch (error) {
      console.error("❌ 溫度圖層添加失敗:", error);
    }

    // 降水圖層 - 超高飽和度藍色
    try {
      map.current.addSource("openweather-precipitation", {
        type: "raster",
        tiles: [
          `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=c3021b469b0ad866b2e96b3e5676347f`,
        ],
        tileSize: 256,
      });

      map.current.addLayer({
        id: "lst-layer",
        type: "raster",
        source: "openweather-precipitation",
        paint: {
          "raster-opacity": 0.75,
          "raster-brightness-min": 0.2,
          "raster-brightness-max": 1.0, // 最大值為1
          "raster-contrast": 1.0, // 最大對比度
          "raster-saturation": 1.0, // 最大飽和度 (最大值為1)
        },
        layout: {
          visibility: "visible", // 默認顯示
        },
      });
      console.log("✅ 降水圖層已添加 (visible)");
    } catch (error) {
      console.error("❌ 降水圖層添加失敗:", error);
    }

    // 風速圖層
    try {
      map.current.addSource("openweather-wind", {
        type: "raster",
        tiles: [
          `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=c3021b469b0ad866b2e96b3e5676347f`,
        ],
        tileSize: 256,
      });

      map.current.addLayer({
        id: "wind-layer",
        type: "raster",
        source: "openweather-wind",
        paint: {
          "raster-opacity": 0.85,
          "raster-brightness-min": 0.1,
          "raster-brightness-max": 1.0, // 最大值為1
          "raster-contrast": 0.8,
          "raster-saturation": 1.0, // 最大飽和度
        },
        layout: {
          visibility: layersRef.current?.wind?.enabled ? "visible" : "none",
        },
      });
      console.log("✅ 風速圖層已添加");
    } catch (error) {
      console.error("❌ 風速圖層添加失敗:", error);
    }

    // 創建風向箭頭 - 使用自定義 SVG 箭頭
    try {
      // 創建箭頭 SVG 圖像
      const arrowSvg = `
        <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2 L14 10 L10 8 L6 10 Z" fill="#00FFFF" stroke="#FFFFFF" stroke-width="1"/>
        </svg>
      `;

      const arrowImage = new Image(20, 20);
      arrowImage.onload = () => {
        if (map.current && !map.current.hasImage("wind-arrow")) {
          map.current.addImage("wind-arrow", arrowImage);
          console.log("✅ 箭頭圖標已載入");

          // 創建風向箭頭數據
          const windArrows = [];
          const gridSize = 5; // 減少密度以提升性能和可見度

          for (let lng = -180; lng < 180; lng += gridSize) {
            for (let lat = -85; lat < 85; lat += gridSize) {
              const rotation =
                Math.atan2(lat - 24, lng - 120) * (180 / Math.PI);
              windArrows.push({
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [lng, lat],
                },
                properties: {
                  rotation: rotation,
                  speed: 5 + Math.random() * 10,
                },
              });
            }
          }

          map.current.addSource("wind-arrows", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: windArrows,
            },
          });

          // 風向箭頭符號圖層
          map.current.addLayer({
            id: "wind-arrow-layer",
            type: "symbol",
            source: "wind-arrows",
            minzoom: 3, // 縮放等級3以上才顯示,避免過於密集
            layout: {
              "icon-image": "wind-arrow",
              "icon-size": 1.0,
              "icon-rotate": ["get", "rotation"],
              "icon-rotation-alignment": "map",
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
              visibility: layersRef.current?.wind?.enabled ? "visible" : "none",
            },
            paint: {
              "icon-opacity": 0.8,
            },
          });
          console.log("✅ 風向箭頭圖層已添加");
        }
      };
      arrowImage.src = "data:image/svg+xml;base64," + btoa(arrowSvg);
    } catch (error) {
      console.error("❌ 風向箭頭圖層添加失敗:", error);
    }

    // 雲層圖層
    try {
      map.current.addSource("openweather-clouds", {
        type: "raster",
        tiles: [
          `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=c3021b469b0ad866b2e96b3e5676347f`,
        ],
        tileSize: 256,
      });

      map.current.addLayer({
        id: "waves-layer",
        type: "raster",
        source: "openweather-clouds",
        paint: {
          "raster-opacity": 0.7,
          "raster-brightness-min": 0.3,
          "raster-brightness-max": 1.0, // 最大值為1
          "raster-contrast": 0.4,
        },
        layout: {
          visibility: layersRef.current?.waves?.enabled ? "visible" : "none",
        },
      });
      console.log("✅ 雲層圖層已添加");
    } catch (error) {
      console.error("❌ 雲層圖層添加失敗:", error);
    }

    // 氣壓圖層
    try {
      map.current.addSource("openweather-pressure", {
        type: "raster",
        tiles: [
          `https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=c3021b469b0ad866b2e96b3e5676347f`,
        ],
        tileSize: 256,
      });

      map.current.addLayer({
        id: "chlorophyll-layer",
        type: "raster",
        source: "openweather-pressure",
        paint: {
          "raster-opacity": 0.7,
          "raster-contrast": 0.8,
          "raster-saturation": 1.0, // 最大飽和度
        },
        layout: {
          visibility: layersRef.current?.chlorophyll?.enabled
            ? "visible"
            : "none",
        },
      });
      console.log("✅ 氣壓圖層已添加");
    } catch (error) {
      console.error("❌ 氣壓圖層添加失敗:", error);
    }

    console.log("✅ 所有氣象圖層載入完成!");
  };

  // 保存函數引用
  addWeatherLayersRef.current = addWeatherLayers;

  // 監聽語言切換,更新地圖標籤
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      const currentStyle =
        mapStyle === "satellite"
          ? "mapbox://styles/mapbox/satellite-streets-v12"
          : "mapbox://styles/mapbox/streets-v12";

      map.current.setStyle(currentStyle, { diff: false });

      map.current.once("styledata", () => {
        console.log("🔄 樣式切換完成,重新載入圖層");
        // 重新添加氣象圖層
        if (addWeatherLayersRef.current) {
          addWeatherLayersRef.current();
        }

        // 重新添加標記
        new mapboxgl.Marker({
          color: "#FF6B6B",
          scale: 1.2,
        })
          .setLngLat([120.5377, 24.0513])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div style="padding: 10px;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
                ${i18n.language === "zh" ? "彰化師範大學" : "NCUE"}
              </h3>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">
                <strong>${
                  i18n.language === "zh" ? "經度" : "Longitude"
                }:</strong> 120.5377°E
              </p>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">
                <strong>${
                  i18n.language === "zh" ? "緯度" : "Latitude"
                }:</strong> 24.0513°N
              </p>
            </div>`
            )
          )
          .addTo(map.current);
      });
    }
  }, [i18n.language, mapStyle]);

  // 處理圖層變更
  const handleLayerChange = (layers) => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    // 保存圖層狀態
    layersRef.current = layers;

    // 圖層ID映射
    const layerMapping = {
      sst: "sst-layer", // 溫度
      lst: "lst-layer", // 降水
      wind: ["wind-layer", "wind-arrow-layer"], // 風速 + 風向箭頭
      waves: "waves-layer", // 雲層
      chlorophyll: "chlorophyll-layer", // 氣壓
    };

    // 遍歷所有圖層並更新
    Object.keys(layerMapping).forEach((key) => {
      const layerIds = Array.isArray(layerMapping[key])
        ? layerMapping[key]
        : [layerMapping[key]];

      layerIds.forEach((layerId) => {
        if (map.current.getLayer(layerId) && layers[key]) {
          // 設置可見性
          map.current.setLayoutProperty(
            layerId,
            "visibility",
            layers[key].enabled ? "visible" : "none"
          );

          // 設置透明度 (僅對 raster 圖層)
          if (map.current.getLayer(layerId).type === "raster") {
            map.current.setPaintProperty(
              layerId,
              "raster-opacity",
              layers[key].opacity / 100
            );
          }

          // 設置箭頭透明度 (symbol 圖層)
          if (map.current.getLayer(layerId).type === "symbol") {
            map.current.setPaintProperty(
              layerId,
              "icon-opacity",
              layers[key].opacity / 100
            );
          }
        }
      });
    });

    console.log("✅ 圖層狀態已更新:", layers);
  };

  useEffect(() => {
    if (map.current) return; // 避免重複初始化

    // 初始化地圖 - 使用亮色底圖
    const initialStyle = "mapbox://styles/mapbox/streets-v12";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: initialStyle,
      center: [lng, lat],
      zoom: zoom,
      minZoom: 1.5,
      locale:
        i18n.language === "zh" ? { language: "zh-Hans" } : { language: "en" },
    });

    // 添加導航控制器
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // 添加比例尺
    map.current.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: "metric",
      }),
      "bottom-left"
    );

    // 地圖載入完成後添加圖層和標記
    map.current.on("load", () => {
      console.log("🗺️ 地圖載入完成");
      // 添加氣象圖層
      if (addWeatherLayersRef.current) {
        addWeatherLayersRef.current();
      }

      // 彰化師範大學標記點
      const marker = new mapboxgl.Marker({
        color: "#FF6B6B",
        scale: 1.2,
      })
        .setLngLat([120.5377, 24.0513])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div style="padding: 10px;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
                ${i18n.language === "zh" ? "彰化師範大學" : "NCUE"}
              </h3>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">
                <strong>${
                  i18n.language === "zh" ? "經度" : "Longitude"
                }:</strong> 120.5377°E
              </p>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">
                <strong>${
                  i18n.language === "zh" ? "緯度" : "Latitude"
                }:</strong> 24.0513°N
              </p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #999;">
                ${i18n.language === "zh" ? "示範採樣點" : "Demo Sampling Point"}
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #1976d2;">
                🌡️ ${
                  i18n.language === "zh"
                    ? "溫度圖層已啟用"
                    : "Temperature layers enabled"
                }
              </p>
            </div>`
          )
        )
        .addTo(map.current);

      // 自動打開 popup
      marker.togglePopup();
    });

    // 清理函數
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <Container maxWidth={false} disableGutters sx={{ py: 4, px: 3 }}>
      <Box sx={{ width: "100%" }}>
        {/* 頁面標題 */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1976d2",
              mb: 1,
            }}
          >
            🗺️ {t("nav.map")}
          </Typography>
          <Typography variant="body2" sx={{ color: "#666" }}>
            {i18n.language === "zh"
              ? "全球海洋與氣象數據可視化"
              : "Global Ocean & Meteorological Data Visualization"}
          </Typography>
        </Box>

        {/* 地圖容器與控制組件 */}
        <Box sx={{ position: "relative", width: "100%" }}>
          {/* 地圖 */}
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

          {/* 時間控制器（右上角） */}
          <TimeController projectId="BEE001" />

          {/* 圖層控制器（右側） */}
          <LayerControl onLayerChange={handleLayerChange} />

          {/* 地圖樣式切換按鈕（右下角） */}
          <Box
            sx={{
              position: "absolute",
              bottom: 20,
              right: 20,
              zIndex: 1000,
            }}
          >
            <Box
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                overflow: "hidden",
                border: "1px solid #ddd",
              }}
            >
              <Box
                onClick={() => setMapStyle("streets")}
                sx={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  backgroundColor:
                    mapStyle === "streets" ? "#1976d2" : "transparent",
                  color: mapStyle === "streets" ? "white" : "#333",
                  fontWeight: mapStyle === "streets" ? 600 : 400,
                  fontSize: "13px",
                  transition: "all 0.2s",
                  borderBottom: "1px solid #eee",
                  "&:hover": {
                    backgroundColor:
                      mapStyle === "streets" ? "#1565c0" : "#f5f5f5",
                  },
                }}
              >
                🗺️ {i18n.language === "zh" ? "街道地圖" : "Street Map"}
              </Box>
              <Box
                onClick={() => setMapStyle("satellite")}
                sx={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  backgroundColor:
                    mapStyle === "satellite" ? "#1976d2" : "transparent",
                  color: mapStyle === "satellite" ? "white" : "#333",
                  fontWeight: mapStyle === "satellite" ? 600 : 400,
                  fontSize: "13px",
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor:
                      mapStyle === "satellite" ? "#1565c0" : "#f5f5f5",
                  },
                }}
              >
                🛰️ {i18n.language === "zh" ? "衛星地圖" : "Satellite"}
              </Box>
            </Box>
          </Box>

          {/* 圖層狀態指示器 (左下角) */}
          <Box
            sx={{
              position: "absolute",
              bottom: 50,
              left: 10,
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              color: "white",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "12px",
              zIndex: 1000,
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                fontWeight: "700",
                marginBottom: "8px",
                fontSize: "13px",
                color: "#fff",
              }}
            >
              {i18n.language === "zh" ? "🌐 即時氣象" : "🌐 Live Weather"}
            </div>
            <div
              style={{ fontSize: "11px", marginBottom: "3px", color: "#fff" }}
            >
              🌡️ {i18n.language === "zh" ? "溫度分布" : "Temperature"} · 🌧️{" "}
              {i18n.language === "zh" ? "降水強度" : "Precipitation"}
            </div>
            <div
              style={{ fontSize: "11px", marginBottom: "3px", color: "#fff" }}
            >
              💨{" "}
              {i18n.language === "zh"
                ? "風速風向 (含亮青色箭頭)"
                : "Wind + Cyan Arrows"}{" "}
              · ☁️ {i18n.language === "zh" ? "雲層覆蓋" : "Clouds"}
            </div>
            <div
              style={{ fontSize: "11px", marginBottom: "8px", color: "#fff" }}
            >
              📊 {i18n.language === "zh" ? "氣壓系統" : "Pressure"}
            </div>

            {/* 溫度色階 */}
            <div
              style={{
                background:
                  "linear-gradient(to right, #0000FF, #00FFFF, #00FF00, #FFFF00, #FF0000)",
                height: "8px",
                borderRadius: "4px",
                marginBottom: "4px",
              }}
            ></div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "9px",
                opacity: 0.8,
              }}
            >
              <span>{i18n.language === "zh" ? "冷" : "Cold"}</span>
              <span>{i18n.language === "zh" ? "溫度" : "Temp"}</span>
              <span>{i18n.language === "zh" ? "熱" : "Hot"}</span>
            </div>

            <div
              style={{
                marginTop: "8px",
                fontSize: "10px",
                opacity: 0.7,
                fontStyle: "italic",
              }}
            >
              {i18n.language === "zh"
                ? "※ 放大海洋區域觀察"
                : "※ Zoom to ocean areas"}
            </div>
          </Box>
        </Box>

        {/* 說明文字 */}
        <Box
          sx={{
            mt: 2,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" sx={{ color: "#555", fontSize: "13px" }}>
            📍 {i18n.language === "zh" ? "示範標記：" : "Demo Marker: "}
            {i18n.language === "zh"
              ? "彰化師範大學進德校區"
              : "NCUE Jinde Campus"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#555", fontSize: "13px" }}>
            �️{" "}
            {i18n.language === "zh"
              ? "溫度圖層：SST (海表) + LST (陸表)"
              : "Temperature: SST (Sea) + LST (Land)"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#555", fontSize: "13px" }}>
            🛰️{" "}
            {i18n.language === "zh"
              ? "數據來源：OpenWeatherMap 即時數據"
              : "Data: OpenWeatherMap Real-time"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#555", fontSize: "13px" }}>
            🎨{" "}
            {i18n.language === "zh"
              ? "設計：超高飽和度色彩 + 亮色底圖"
              : "Design: Ultra-vibrant colors + Bright map"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#555", fontSize: "13px" }}>
            💨{" "}
            {i18n.language === "zh"
              ? "風場：開啟風速圖層查看亮青色箭頭 (zoom 2+)"
              : "Wind: Enable to see cyan arrows (zoom 2+)"}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#1976d2", fontSize: "13px", fontWeight: 600 }}
          >
            🌍{" "}
            {i18n.language === "zh"
              ? "地圖標籤支援中英文切換"
              : "Map labels support CN/EN toggle"}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#2e7d32", fontSize: "13px", fontWeight: 600 }}
          >
            🛰️{" "}
            {i18n.language === "zh"
              ? "右下角可切換衛星/街道地圖"
              : "Toggle Satellite/Street view (bottom-right)"}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Map;

import { useEffect, useRef, useState } from "react";
import { Container, Box, Typography } from "@mui/material";
import LayersIcon from "@mui/icons-material/Layers";
import MapIcon from "@mui/icons-material/Map";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTranslation } from "react-i18next";
import TimeController from "../components/TimeController";
import LayerControl from "../components/LayerControl";
import DataModeSelector from "../components/DataModeSelector";
import SampleSearchDialog from "../components/SampleSearchDialog";
import DatePickerDialog from "../components/DatePickerDialog";
import TimelineControls from "../components/TimelineControls";
import useTimelineAnimation from "../hooks/useTimelineAnimation";
import { api } from "../services/api";

// Mapbox Access Token
mapboxgl.accessToken =
  "pk.eyJ1IjoiYmVlLWRuYSIsImEiOiJjbWZ5MTlhOTkwZnF3MmxvbjkwN2RtM2Z4In0.yFiY2MNpWqaDINuLaz1e0w";

const Map = () => {
  const { t, i18n } = useTranslation();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng] = useState(120.5377);
  const [lat] = useState(24.0513);
  const [zoom] = useState(2);
  const [mapStyle, setMapStyle] = useState("streets");
  const [dataMode, setDataMode] = useState("live"); // 資料模式：live, search, date
  const [selectedDate, setSelectedDate] = useState(null); // 選中的日期
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [expanded, setExpanded] = useState(false); // For layer control
  const layersRef = useRef(null);
  const addWeatherLayersRef = useRef(null);
  const layerPanelRef = useRef(null); // For click outside detection

  // 後端配置
  const [backendConfig, setBackendConfig] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [timestampCount, setTimestampCount] = useState(48); // 預設值

  // 圖層狀態管理
  const [layerStates, setLayerStates] = useState({
    sst: {
      enabled: false,
      opacity: 70,
      name: "全球溫度",
      nameEn: "Temperature",
    },
    lst: {
      enabled: false,
      opacity: 60,
      name: "降水分布",
      nameEn: "Precipitation",
    },
    wind: {
      enabled: false,
      opacity: 70,
      name: "風速風向",
      nameEn: "Wind Speed",
    },
    waves: { enabled: false, opacity: 60, name: "雲層", nameEn: "Clouds" },
    chlorophyll: {
      enabled: false,
      opacity: 70,
      name: "氣壓",
      nameEn: "Pressure",
    },
  });

  // 載入後端配置
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await api.getConfig();
        setBackendConfig(config);

        // 提取可用日期
        const dates = config.features?.date_ranges || [];
        setAvailableDates(dates);

        // 提取時間戳數量
        const count = config.features?.timestamp_count || 48;
        setTimestampCount(count);

        console.log("Backend config loaded:", {
          dates,
          timestampCount: count,
          layers: config.layers,
        });
      } catch (error) {
        console.error("Failed to fetch backend config:", error);
        // 使用預設值
        setAvailableDates(["2023-01-01", "2024-05-05"]);
        setTimestampCount(48);
      }
    };

    fetchConfig();
  }, []);

  // 時間軸動畫控制（僅在歷史資料模式使用）
  const {
    currentFrame,
    totalFrames,
    isPlaying,
    timestamp,
    play,
    pause,
    stop,
    nextFrame,
    previousFrame,
    goToFrame,
  } = useTimelineAnimation({
    totalFrames: timestampCount, // 動態從後端配置獲取
    duration: 5000, // 5秒完整循環
    autoPlay: false,
    loop: true,
  });

  // 處理模式切換
  const handleModeChange = (mode) => {
    if (mode === "search") {
      setSearchDialogOpen(true);
      // 不立即切換 dataMode,等用戶選擇後再切換
    } else if (mode === "date") {
      setDatePickerOpen(true);
      // 不立即切換 dataMode,等用戶選擇後再切換
    } else if (mode === "historical") {
      // 直接切換到歷史模式,使用預設資料
      setDataMode("historical");
      setSelectedDate(null);
      goToFrame(0); // 從第一幀開始
      play(); // 自動播放動畫
      // 載入歷史資料圖層
      if (addWeatherLayersRef.current) {
        addWeatherLayersRef.current();
      }
    } else if (mode === "live") {
      setDataMode("live");
      setSelectedDate(null);
      stop(); // 停止動畫
      // 切換回即時資料
      if (addWeatherLayersRef.current) {
        addWeatherLayersRef.current();
      }
    }
  };

  // 處理樣本搜尋
  const handleSampleSearch = (date) => {
    setSelectedDate(date);
    setDataMode("historical");
    setSearchDialogOpen(false);
    // 載入該日期的歷史資料
    loadHistoricalData(date);
    // 自動播放
    goToFrame(0);
    play();
  };

  // 處理日期選擇
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setDataMode("historical");
    setDatePickerOpen(false);
    // 載入該日期的歷史資料
    loadHistoricalData(date);
    // 自動播放
    goToFrame(0);
    play();
  };

  // 載入歷史資料
  const loadHistoricalData = (date) => {
    console.log("Loading historical data for:", date);

    // 動態計算日期對應的起始幀
    const dateIndex = availableDates.indexOf(date);

    if (dateIndex === -1) {
      console.warn("Selected date not found in available dates:", date);
      goToFrame(0);
      return;
    }

    // 假設每天 24 小時
    const hoursPerDay = 24;
    const startFrame = dateIndex * hoursPerDay;

    console.log(
      `Date ${date} -> Index ${dateIndex} -> Start frame ${startFrame}`
    );
    goToFrame(startFrame);

    // 更新地圖圖層為 MBTiles
    if (addWeatherLayersRef.current) {
      addWeatherLayersRef.current();
    }
  };

  // Auto-close layer panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        expanded &&
        layerPanelRef.current &&
        !layerPanelRef.current.contains(event.target) &&
        !event.target.closest("[data-layer-toggle]")
      ) {
        setExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expanded]);

  // Add all weather layers
  const addWeatherLayers = () => {
    if (!map.current) {
      console.log("map.current does not exist");
      return;
    }

    // Wait for map style to fully load
    if (!map.current.isStyleLoaded()) {
      console.log("Waiting for map style to load...");
      map.current.once("styledata", () => {
        if (addWeatherLayersRef.current) {
          addWeatherLayersRef.current();
        }
      });
      return;
    }

    console.log("Starting to add weather layers...", "Mode:", dataMode);

    // Remove old layers
    const layerIds = [
      "sst-layer",
      "lst-layer",
      "wind-layer",
      "waves-layer",
      "chlorophyll-layer",
    ];
    layerIds.forEach((id) => {
      if (map.current.getLayer(id)) {
        map.current.removeLayer(id);
      }
    });

    // Remove old sources
    const sourceIds = [
      "openweather-temp",
      "openweather-precipitation",
      "openweather-wind",
      "openweather-clouds",
      "openweather-pressure",
      "mbtiles-temp",
      "mbtiles-precipitation",
      "mbtiles-wind",
      "mbtiles-clouds",
      "mbtiles-pressure",
    ];
    sourceIds.forEach((id) => {
      if (map.current.getSource(id)) {
        map.current.removeSource(id);
      }
    });

    // 根據模式選擇資料源
    const isHistorical = dataMode === "historical";

    if (isHistorical) {
      // 使用 MBTiles 歷史資料
      console.log("Loading historical MBTiles data...");
      addHistoricalLayers();
    } else {
      // 使用即時 OpenWeather 資料
      console.log("Loading live OpenWeather data...");
      addLiveLayers();
    }
  };

  // 添加即時圖層（OpenWeather）
  const addLiveLayers = () => {
    // Temperature layer - high saturation
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
          visibility: "none",
        },
      });
      console.log("Temperature layer added (disabled by default)");
    } catch (error) {
      console.error("Failed to add temperature layer:", error);
    }

    // Precipitation layer - high saturation blue
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
          visibility: "none",
        },
      });
      console.log("Precipitation layer added (disabled by default)");
    } catch (error) {
      console.error("Failed to add precipitation layer:", error);
    }

    // Wind layer (raster only, no arrows for now)
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
          "raster-brightness-max": 1.0,
          "raster-contrast": 0.8,
          "raster-saturation": 1.0,
        },
        layout: {
          visibility: layersRef.current?.wind?.enabled ? "visible" : "none",
        },
      });
      console.log("Wind layer added (raster only)");
    } catch (error) {
      console.error("Failed to add wind layer:", error);
    }

    // Cloud layer
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
          "raster-brightness-max": 1.0,
          "raster-contrast": 0.4,
        },
        layout: {
          visibility: layersRef.current?.waves?.enabled ? "visible" : "none",
        },
      });
      console.log("Cloud layer added");
    } catch (error) {
      console.error("Failed to add cloud layer:", error);
    }

    // Pressure layer
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
          "raster-saturation": 1.0,
        },
        layout: {
          visibility: layersRef.current?.chlorophyll?.enabled
            ? "visible"
            : "none",
        },
      });
      console.log("Pressure layer added");
    } catch (error) {
      console.error("Failed to add pressure layer:", error);
    }

    console.log("All weather layers loaded!");

    // 同步圖層狀態到 UI
    setTimeout(() => {
      syncLayerStates();
    }, 500);

    // 初始化 layersRef（如果還沒設置）
    if (!layersRef.current) {
      layersRef.current = layerStates;
      console.log("Initialized layersRef with current layerStates");
    }

    // Apply pending layer changes if any
    if (layersRef.current) {
      console.log(
        "Applying layer state after layers loaded:",
        layersRef.current
      );
      // Use multiple checks with increasing delays to ensure layers are ready
      const applyLayerState = (attempt = 1) => {
        const maxAttempts = 5;

        setTimeout(() => {
          const layerMapping = {
            sst: "sst-layer",
            lst: "lst-layer",
            wind: "wind-layer",
            waves: "waves-layer",
            chlorophyll: "chlorophyll-layer",
          };

          let allLayersReady = true;

          Object.keys(layerMapping).forEach((key) => {
            const layerIds = Array.isArray(layerMapping[key])
              ? layerMapping[key]
              : [layerMapping[key]];

            layerIds.forEach((layerId) => {
              if (!map.current.getLayer(layerId)) {
                allLayersReady = false;
                console.log(
                  `Layer ${layerId} not ready yet (attempt ${attempt})`
                );
              } else if (layersRef.current[key]) {
                const visibility = layersRef.current[key].enabled
                  ? "visible"
                  : "none";
                const opacity = layersRef.current[key].opacity / 100;

                try {
                  map.current.setLayoutProperty(
                    layerId,
                    "visibility",
                    visibility
                  );

                  // Set opacity based on layer type
                  const layerType = map.current.getLayer(layerId).type;
                  if (layerType === "raster") {
                    map.current.setPaintProperty(
                      layerId,
                      "raster-opacity",
                      opacity
                    );
                  } else if (layerType === "symbol") {
                    map.current.setPaintProperty(
                      layerId,
                      "icon-opacity",
                      opacity
                    );
                  }

                  console.log(
                    `Applied ${layerId}: visibility=${visibility}, opacity=${opacity}`
                  );
                } catch (error) {
                  console.error(`Error applying state to ${layerId}:`, error);
                  allLayersReady = false;
                }
              }
            });
          });

          // If not all layers ready and we haven't exceeded max attempts, try again
          if (!allLayersReady && attempt < maxAttempts) {
            console.log(
              `Retrying layer state application (attempt ${
                attempt + 1
              }/${maxAttempts})`
            );
            applyLayerState(attempt + 1);
          } else if (allLayersReady) {
            console.log("All layer states applied successfully");
          } else {
            console.warn(
              "Max attempts reached, some layers may not be configured"
            );
          }
        }, attempt * 100); // Increase delay with each attempt
      };

      applyLayerState();
    }
  };

  // 添加歷史圖層（MBTiles）
  const addHistoricalLayers = () => {
    console.log("Adding historical MBTiles layers with frame:", currentFrame);

    try {
      // Temperature (MBTiles)
      map.current.addSource("mbtiles-temp", {
        type: "raster",
        tiles: [api.getTileUrl("temperature", currentFrame)],
        tileSize: 256,
      });

      map.current.addLayer({
        id: "sst-layer",
        type: "raster",
        source: "mbtiles-temp",
        paint: {
          "raster-opacity": (layerStates.sst?.opacity || 70) / 100,
        },
        layout: {
          visibility: layerStates.sst?.enabled ? "visible" : "none",
        },
      });
      console.log("MBTiles temperature layer added");
    } catch (error) {
      console.error("Failed to add MBTiles temperature layer:", error);
    }

    try {
      // Precipitation (MBTiles)
      map.current.addSource("mbtiles-precipitation", {
        type: "raster",
        tiles: [api.getTileUrl("precipitation", currentFrame)],
        tileSize: 256,
      });

      map.current.addLayer({
        id: "lst-layer",
        type: "raster",
        source: "mbtiles-precipitation",
        paint: {
          "raster-opacity": (layerStates.lst?.opacity || 60) / 100,
        },
        layout: {
          visibility: layerStates.lst?.enabled ? "visible" : "none",
        },
      });
      console.log("MBTiles precipitation layer added");
    } catch (error) {
      console.error("Failed to add MBTiles precipitation layer:", error);
    }

    try {
      // Wind (MBTiles)
      map.current.addSource("mbtiles-wind", {
        type: "raster",
        tiles: [api.getTileUrl("wind", currentFrame)],
        tileSize: 256,
      });

      map.current.addLayer({
        id: "wind-layer",
        type: "raster",
        source: "mbtiles-wind",
        paint: {
          "raster-opacity": (layerStates.wind?.opacity || 70) / 100,
        },
        layout: {
          visibility: layerStates.wind?.enabled ? "visible" : "none",
        },
      });
      console.log("MBTiles wind layer added");
    } catch (error) {
      console.error("Failed to add MBTiles wind layer:", error);
    }

    try {
      // Clouds (MBTiles)
      map.current.addSource("mbtiles-clouds", {
        type: "raster",
        tiles: [api.getTileUrl("clouds", currentFrame)],
        tileSize: 256,
      });

      map.current.addLayer({
        id: "waves-layer",
        type: "raster",
        source: "mbtiles-clouds",
        paint: {
          "raster-opacity": (layerStates.waves?.opacity || 60) / 100,
        },
        layout: {
          visibility: layerStates.waves?.enabled ? "visible" : "none",
        },
      });
      console.log("MBTiles clouds layer added");
    } catch (error) {
      console.error("Failed to add MBTiles clouds layer:", error);
    }

    try {
      // Pressure (MBTiles)
      map.current.addSource("mbtiles-pressure", {
        type: "raster",
        tiles: [api.getTileUrl("pressure", currentFrame)],
        tileSize: 256,
      });

      map.current.addLayer({
        id: "chlorophyll-layer",
        type: "raster",
        source: "mbtiles-pressure",
        paint: {
          "raster-opacity": (layerStates.chlorophyll?.opacity || 70) / 100,
        },
        layout: {
          visibility: layerStates.chlorophyll?.enabled ? "visible" : "none",
        },
      });
      console.log("MBTiles pressure layer added");
    } catch (error) {
      console.error("Failed to add MBTiles pressure layer:", error);
    }

    console.log("All MBTiles layers loaded!");

    // 同步圖層狀態到 UI
    setTimeout(() => {
      syncLayerStates();
    }, 500);

    // 初始化 layersRef（如果還沒設置）
    if (!layersRef.current) {
      layersRef.current = layerStates;
      console.log(
        "Initialized layersRef with current layerStates (historical mode)"
      );
    }
  };

  // Save function reference
  addWeatherLayersRef.current = addWeatherLayers;

  // 監聽 currentFrame 變化，在歷史模式下更新圖層
  useEffect(() => {
    if (
      !map.current ||
      !map.current.isStyleLoaded() ||
      dataMode !== "historical"
    ) {
      return;
    }

    console.log(
      "CurrentFrame changed to:",
      currentFrame,
      "Updating tile sources..."
    );

    // 更新所有 MBTiles 圖層的 tiles URL
    const layers = [
      { source: "mbtiles-temp", layer: "temperature" },
      { source: "mbtiles-precipitation", layer: "precipitation" },
      { source: "mbtiles-wind", layer: "wind" },
      { source: "mbtiles-clouds", layer: "clouds" },
      { source: "mbtiles-pressure", layer: "pressure" },
    ];

    layers.forEach(({ source, layer }) => {
      const sourceObj = map.current.getSource(source);
      if (sourceObj) {
        // 更新 source 的 tiles URL
        sourceObj.setTiles([api.getTileUrl(layer, currentFrame)]);
        console.log(`Updated ${source} to frame ${currentFrame}`);
      }
    });
  }, [currentFrame, dataMode]);

  // 監聽 dataMode 變化,自動切換圖層
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || !isInitialized) {
      return;
    }

    console.log("DataMode changed to:", dataMode);

    // 切換圖層
    if (addWeatherLayersRef.current) {
      addWeatherLayersRef.current();
    }
  }, [dataMode, isInitialized]);

  // 監聽地圖樣式切換 (只在初始化後才執行)
  useEffect(() => {
    if (!map.current || !isInitialized) return;

    const currentStyle =
      mapStyle === "satellite"
        ? "mapbox://styles/mapbox/satellite-streets-v12"
        : "mapbox://styles/mapbox/streets-v12";

    console.log(`Switching to ${mapStyle} style...`);

    // Remove existing event listeners to prevent duplicates
    map.current.off("style.load");

    map.current.setStyle(currentStyle);

    // Wait for style to fully load - using idle event for better reliability
    const onStyleLoad = () => {
      console.log(`${mapStyle} style loaded, waiting for idle state...`);

      map.current.once("idle", () => {
        console.log("Map is idle, re-adding layers...");

        // Re-add weather layers
        if (addWeatherLayersRef.current) {
          addWeatherLayersRef.current();
        }

        // Re-add marker
        new mapboxgl.Marker({
          color: "#FF6B6B",
          scale: 1.2,
        })
          .setLngLat([120.5377, 24.0513])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div style="padding: 10px;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
                NCUE
              </h3>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">
                <strong>Longitude:</strong> 120.5377°E
              </p>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">
                <strong>Latitude:</strong> 24.0513°N
              </p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #999;">
                Demo Sampling Point
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #1976d2;">
                🌡️ Temperature layers enabled
              </p>
            </div>`
            )
          )
          .addTo(map.current);
      });
    };

    map.current.once("style.load", onStyleLoad);
  }, [mapStyle, isInitialized]);

  // 處理圖層變更
  const handleLayerChange = (layers) => {
    console.log("handleLayerChange called with:", layers);

    // 更新 state
    setLayerStates(layers);
    // 保存圖層狀態到 ref
    layersRef.current = layers;

    if (!map.current) {
      console.log("Map not initialized");
      return;
    }

    // 定義更新圖層的函數
    const updateLayers = () => {
      // 圖層ID映射
      const layerMapping = {
        sst: "sst-layer", // 溫度
        lst: "lst-layer", // 降水
        wind: "wind-layer", // 風速
        waves: "waves-layer", // 雲層
        chlorophyll: "chlorophyll-layer", // 氣壓
      };

      // 遍歷所有圖層並更新
      Object.keys(layerMapping).forEach((key) => {
        const layerIds = Array.isArray(layerMapping[key])
          ? layerMapping[key]
          : [layerMapping[key]];

        layerIds.forEach((layerId) => {
          const layerExists = map.current.getLayer(layerId);

          if (layerExists && layers[key]) {
            const visibility = layers[key].enabled ? "visible" : "none";
            console.log(`Setting ${layerId} visibility to ${visibility}`);

            try {
              // 設置可見性
              map.current.setLayoutProperty(layerId, "visibility", visibility);

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
            } catch (error) {
              console.error(`Error updating layer ${layerId}:`, error);
            }
          }
        });
      });

      console.log("Layer status updated:", layers);
    };

    // 立即嘗試更新
    if (map.current.isStyleLoaded()) {
      updateLayers();
    } else {
      // 如果樣式還在加載,等待加載完成後更新
      console.log("Map style not loaded yet, waiting...");
      map.current.once("idle", updateLayers);
    }
  };

  // 同步地圖圖層實際狀態到 state
  const syncLayerStates = () => {
    if (!map.current || !map.current.isStyleLoaded()) {
      return;
    }

    const layerMapping = {
      sst: "sst-layer",
      lst: "lst-layer",
      wind: "wind-layer",
      waves: "waves-layer",
      chlorophyll: "chlorophyll-layer",
    };

    const updatedStates = { ...layerStates };
    let hasChanges = false;

    Object.keys(layerMapping).forEach((key) => {
      const layerId = layerMapping[key];
      const layer = map.current.getLayer(layerId);

      if (layer) {
        const visibility = map.current.getLayoutProperty(layerId, "visibility");
        const isVisible = visibility === "visible";

        if (updatedStates[key].enabled !== isVisible) {
          updatedStates[key] = {
            ...updatedStates[key],
            enabled: isVisible,
          };
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setLayerStates(updatedStates);
      console.log("Layer states synchronized from map:", updatedStates);
    }
  };

  useEffect(() => {
    if (map.current) return; // Avoid duplicate initialization

    // 初始化地圖 - 使用亮色底圖
    const initialStyle = "mapbox://styles/mapbox/streets-v12";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: initialStyle,
      center: [lng, lat],
      zoom: zoom,
      minZoom: 1.5,
      locale: { language: "zh-Hans" },
      attributionControl: false, // 先移除預設的版權控制
    });

    // 添加自訂的緊湊版權控制器
    map.current.addControl(
      new mapboxgl.AttributionControl({
        compact: true, // 緊湊模式:只顯示圖示
      }),
      "bottom-right"
    );

    // 添加導航控制器 (只顯示縮放按鈕,隱藏指南針)
    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    // 自定義導航控制器樣式
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      /* 美化 Mapbox 縮放按鈕 */
      .mapboxgl-ctrl-group {
        background: white !important;
        border-radius: 8px !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        border: none !important;
      }
      
      .mapboxgl-ctrl-group button {
        width: 32px !important;
        height: 32px !important;
        border: none !important;
        background-color: white !important;
        transition: all 0.2s ease !important;
      }
      
      .mapboxgl-ctrl-group button:hover {
        background-color: #f5f5f5 !important;
      }
      
      .mapboxgl-ctrl-group button:active {
        background-color: #e0e0e0 !important;
      }
      
      .mapboxgl-ctrl-group button + button {
        border-top: 1px solid #e0e0e0 !important;
      }
      
      .mapboxgl-ctrl-group button:first-child {
        border-radius: 8px 8px 0 0 !important;
      }
      
      .mapboxgl-ctrl-group button:last-child {
        border-radius: 0 0 8px 8px !important;
      }
      
      .mapboxgl-ctrl-icon {
        opacity: 0.7 !important;
      }
      
      .mapboxgl-ctrl-group button:hover .mapboxgl-ctrl-icon {
        opacity: 1 !important;
      }
      
      /* 版權資訊 - 緊湊模式樣式 */
      .mapboxgl-ctrl-attrib {
        font-size: 10px !important;
        background-color: rgba(255, 255, 255, 0.8) !important;
        border-radius: 4px !important;
      }
      
      /* 緊湊模式 - 未展開狀態 */
      .mapboxgl-ctrl-attrib.mapboxgl-compact {
        min-height: 24px !important;
        padding: 0 !important;
        background-color: rgba(255, 255, 255, 0.8) !important;
        border-radius: 4px !important;
      }
      
      /* 緊湊模式 - 展開狀態 */
      .mapboxgl-ctrl-attrib.mapboxgl-compact-show {
        padding: 4px 28px 4px 8px !important;
        background-color: rgba(255, 255, 255, 0.95) !important;
      }
      
      .mapboxgl-ctrl-attrib-button {
        width: 24px !important;
        height: 24px !important;
        background-color: transparent !important;
        border-radius: 4px !important;
        cursor: pointer !important;
      }
      
      .mapboxgl-ctrl-attrib-button:hover {
        background-color: rgba(0, 0, 0, 0.05) !important;
      }
      
      .mapboxgl-ctrl-attrib-inner {
        font-size: 10px !important;
        line-height: 1.4 !important;
      }
      
      .mapboxgl-ctrl-attrib a {
        font-size: 10px !important;
        color: rgba(0, 0, 0, 0.75) !important;
        text-decoration: none !important;
      }
      
      .mapboxgl-ctrl-attrib a:hover {
        color: rgba(0, 0, 0, 0.9) !important;
        text-decoration: underline !important;
      }
    `;
    document.head.appendChild(styleSheet);

    // 添加比例尺
    map.current.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: "metric",
      }),
      "bottom-left"
    );

    // Add layers and markers when map is loaded
    map.current.on("load", () => {
      console.log("🗺️ Map loaded, waiting for idle...");

      // Wait for map to be fully idle before adding layers
      map.current.once("idle", () => {
        console.log("Map is idle, checking style load status...");
        console.log("Style loaded?", map.current.isStyleLoaded());

        // Force wait a bit more for style to be fully ready
        setTimeout(() => {
          console.log("Adding initial layers now...");
          console.log(
            "Style loaded after timeout?",
            map.current.isStyleLoaded()
          );

          // Add weather layers (all disabled by default)
          // Layer state will be automatically applied inside addWeatherLayers()
          addWeatherLayers();

          // 創建自訂標記元素
          const createCustomMarker = (number, color) => {
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.style.cssText = `
              width: 36px;
              height: 36px;
              background-color: ${color};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 700;
              font-size: 16px;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              cursor: pointer;
              transition: all 0.2s ease;
            `;
            el.textContent = number;
            
            // Hover effect - 使用 box-shadow 和 border 來實現效果
            el.addEventListener('mouseenter', () => {
              el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
              el.style.borderWidth = '4px';
            });
            el.addEventListener('mouseleave', () => {
              el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
              el.style.borderWidth = '3px';
            });
            
            return el;
          };

          // NCUE Marker with custom style
          const markerElement = createCustomMarker('1', '#1976d2');
          const marker = new mapboxgl.Marker({
            element: markerElement,
            anchor: 'center',
          })
            .setLngLat([120.5377, 24.0513])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<div style="padding: 10px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
                    NCUE
                  </h3>
                  <p style="margin: 4px 0; font-size: 12px; color: #666;">
                    <strong>Longitude:</strong> 120.5377°E
                  </p>
                  <p style="margin: 4px 0; font-size: 12px; color: #666;">
                    <strong>Latitude:</strong> 24.0513°N
                  </p>
                  <p style="margin: 8px 0 0 0; font-size: 11px; color: #999;">
                    Demo Sampling Point
                  </p>
                  <p style="margin: 4px 0 0 0; font-size: 11px; color: #1976d2;">
                    🌡️ Temperature layers enabled
                  </p>
                </div>`
              )
            )
            .addTo(map.current);

          // Auto open popup
          marker.togglePopup();

          // Mark as initialized
          setIsInitialized(true);
          console.log("Initial setup complete!");
        }, 500);
      });
    });

    // Cleanup function
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
        {/* Modern Control Bar */}
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
          {/* Left: Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
                {t("map.subtitle")}
              </Typography>
            </Box>
          </Box>

          {/* Center: Time Display - HIDDEN */}
          <Box
            sx={{
              display: "none",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
            }}
          >
            <AccessTimeIcon sx={{ fontSize: 18, color: "#666" }} />
            <Box>
              <Typography
                variant="caption"
                sx={{ fontSize: "10px", color: "#999" }}
              >
                {dataMode === "live"
                  ? t("map.todayData")
                  : t("map.historicalData")}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "12px", fontWeight: 600, color: "#333" }}
              >
                {dataMode === "live"
                  ? new Date().toLocaleString(
                      i18n.language === "zh" ? "zh-TW" : "en-US",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }
                    )
                  : selectedDate
                  ? new Date(selectedDate).toLocaleDateString(
                      i18n.language === "zh" ? "zh-TW" : "en-US",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      }
                    )
                  : t("map.noDateSelected")}
              </Typography>
            </Box>
          </Box>

          {/* Data Mode Selector: 即時 | 搜尋 | 日期 - HIDDEN */}
          <Box sx={{ display: "none" }}>
            <DataModeSelector
              currentMode={dataMode}
              onModeChange={handleModeChange}
            />
          </Box>

          {/* Right: Map Style Toggle & Layer Control */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Map Style Toggle Switch */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#f0f0f0",
                borderRadius: "20px",
                padding: "3px",
                position: "relative",
              }}
            >
              <Box
                onClick={() => setMapStyle("streets")}
                sx={{
                  position: "relative",
                  zIndex: 1,
                  padding: "6px 14px",
                  borderRadius: "17px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: mapStyle === "streets" ? "white" : "#666",
                  transition: "color 0.2s",
                  userSelect: "none",
                }}
              >
                {t("map.mapStyle.street")}
              </Box>
              <Box
                onClick={() => setMapStyle("satellite")}
                sx={{
                  position: "relative",
                  zIndex: 1,
                  padding: "6px 14px",
                  borderRadius: "17px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: mapStyle === "satellite" ? "white" : "#666",
                  transition: "color 0.2s",
                  userSelect: "none",
                }}
              >
                {t("map.mapStyle.satellite")}
              </Box>
              {/* Sliding background */}
              <Box
                sx={{
                  position: "absolute",
                  top: "3px",
                  left: mapStyle === "streets" ? "3px" : "50%",
                  width: "calc(50% - 3px)",
                  height: "calc(100% - 6px)",
                  backgroundColor: "#1976d2",
                  borderRadius: "17px",
                  transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  zIndex: 0,
                }}
              />
            </Box>

            {/* Layer Control Button - HIDDEN */}
            <Box
              data-layer-toggle
              onClick={() => setExpanded(!expanded)}
              sx={{
                display: "none",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1,
                backgroundColor: expanded ? "#1976d2" : "#f5f5f5",
                color: expanded ? "white" : "#666",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
                userSelect: "none",
                "&:hover": {
                  backgroundColor: expanded ? "#1565c0" : "#e0e0e0",
                },
              }}
            >
              <LayersIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
                {t("map.layers")}
              </Typography>
              {expanded ? (
                <ChevronLeftIcon sx={{ fontSize: 18 }} />
              ) : (
                <ChevronRightIcon sx={{ fontSize: 18 }} />
              )}
            </Box>
          </Box>
        </Box>

        {/* Map Container & Controls */}
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

          {/* 圖例 - 左上角 */}
          <Box
            sx={{
              position: "absolute",
              top: "16px",
              left: "16px",
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "12px 14px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              minWidth: "120px",
              zIndex: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: "#333",
                marginBottom: "10px",
                fontSize: "13px",
              }}
            >
              Sample Count
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {/* 76-100 */}
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Box
                  sx={{
                    width: "18px",
                    height: "18px",
                    backgroundColor: "#D32F2F",
                    borderRadius: "50%",
                    flexShrink: 0,
                    border: "2px solid white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
                <Typography sx={{ fontSize: "11px", color: "#666", fontWeight: 500 }}>
                  76-100
                </Typography>
              </Box>
              
              {/* 51-75 */}
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Box
                  sx={{
                    width: "18px",
                    height: "18px",
                    backgroundColor: "#F57C00",
                    borderRadius: "50%",
                    flexShrink: 0,
                    border: "2px solid white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
                <Typography sx={{ fontSize: "11px", color: "#666", fontWeight: 500 }}>
                  51-75
                </Typography>
              </Box>
              
              {/* 26-50 */}
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Box
                  sx={{
                    width: "18px",
                    height: "18px",
                    backgroundColor: "#388E3C",
                    borderRadius: "50%",
                    flexShrink: 0,
                    border: "2px solid white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
                <Typography sx={{ fontSize: "11px", color: "#666", fontWeight: 500 }}>
                  26-50
                </Typography>
              </Box>
              
              {/* 0-25 */}
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Box
                  sx={{
                    width: "18px",
                    height: "18px",
                    backgroundColor: "#1976D2",
                    borderRadius: "50%",
                    flexShrink: 0,
                    border: "2px solid white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
                <Typography sx={{ fontSize: "11px", color: "#666", fontWeight: 500 }}>
                  0-25
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Integrated Layer Control Panel (Right Side) */}
          {expanded && (
            <Box
              ref={layerPanelRef}
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "320px",
                maxHeight: "100%",
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                overflow: "hidden",
                zIndex: 1000,
                animation: "slideIn 0.3s ease-out",
                "@keyframes slideIn": {
                  from: {
                    opacity: 0,
                    transform: "translateX(20px)",
                  },
                  to: {
                    opacity: 1,
                    transform: "translateX(0)",
                  },
                },
              }}
            >
              <LayerControl
                layers={layerStates}
                onLayerChange={handleLayerChange}
              />
            </Box>
          )}

          {/* Temperature Legend (Top Left) - HIDDEN */}
          <Box
            sx={{
              display: "none",
              position: "absolute",
              top: 10,
              left: 10,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "10px",
              zIndex: 1000,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {/* Temperature Scale */}
            <div
              style={{
                background:
                  "linear-gradient(to right, #0000FF, #00FFFF, #00FF00, #FFFF00, #FF0000)",
                height: "6px",
                width: "100px",
                borderRadius: "3px",
                marginBottom: "3px",
              }}
            ></div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "8px",
                color: "#666",
              }}
            >
              <span>{t("map.legend.cold")}</span>
              <span>{t("map.legend.hot")}</span>
            </div>
          </Box>
        </Box>

        {/* Timeline Controls (僅在歷史資料模式顯示) */}
        {dataMode === "historical" && (
          <TimelineControls
            currentFrame={currentFrame}
            totalFrames={totalFrames}
            isPlaying={isPlaying}
            timestamp={timestamp}
            onPlay={play}
            onPause={pause}
            onStop={stop}
            onNext={nextFrame}
            onPrevious={previousFrame}
            onFrameChange={goToFrame}
            dateRange={
              availableDates.length > 0
                ? {
                    start: availableDates[0],
                    end: availableDates[availableDates.length - 1],
                  }
                : null
            }
          />
        )}

        {/* Sample Search Dialog */}
        <SampleSearchDialog
          open={searchDialogOpen}
          onClose={() => setSearchDialogOpen(false)}
          onSearch={handleSampleSearch}
        />

        {/* Date Picker Dialog */}
        <DatePickerDialog
          open={datePickerOpen}
          onClose={() => setDatePickerOpen(false)}
          onDateSelect={handleDateSelect}
        />
      </Box>
    </Container>
  );
};

export default Map;

import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Switch,
  Slider,
  Divider,
  Chip,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import LayersIcon from "@mui/icons-material/Layers";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const LayerControl = ({ onLayerChange }) => {
  const { i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [layers, setLayers] = useState({
    sst: {
      enabled: true,
      opacity: 70,
      name: "全球溫度",
      nameEn: "Temperature",
    },
    lst: {
      enabled: true,
      opacity: 60,
      name: "降水分布",
      nameEn: "Precipitation",
    },
    ocean_current: {
      enabled: false,
      opacity: 80,
      name: "洋流",
      nameEn: "Ocean Current",
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

  const handleToggle = (layerId) => {
    const newLayers = {
      ...layers,
      [layerId]: {
        ...layers[layerId],
        enabled: !layers[layerId].enabled,
      },
    };
    setLayers(newLayers);
    if (onLayerChange) onLayerChange(newLayers);
  };

  const handleOpacityChange = (layerId, value) => {
    const newLayers = {
      ...layers,
      [layerId]: {
        ...layers[layerId],
        opacity: value,
      },
    };
    setLayers(newLayers);
    if (onLayerChange) onLayerChange(newLayers);
  };

  const LayerItem = ({ id, icon, defaultOn = false }) => {
    const layer = layers[id];
    const isZh = i18n.language === "zh";

    return (
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "14px" }}>{icon}</Typography>
            <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
              {isZh ? layer.name : layer.nameEn}
            </Typography>
            {defaultOn && (
              <Chip
                label={isZh ? "預設" : "Default"}
                size="small"
                sx={{ height: "18px", fontSize: "10px" }}
              />
            )}
          </Box>
          <Switch
            size="small"
            checked={layer.enabled}
            onChange={() => handleToggle(id)}
          />
        </Box>
        {layer.enabled && (
          <Box sx={{ mt: 1, px: 1 }}>
            <Typography
              variant="caption"
              sx={{ fontSize: "10px", color: "#666" }}
            >
              {isZh ? "透明度" : "Opacity"}: {layer.opacity}%
            </Typography>
            <Slider
              size="small"
              value={layer.opacity}
              onChange={(e, val) => handleOpacityChange(id, val)}
              sx={{ mt: 0.5 }}
            />
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: "absolute",
        top: 120,
        right: 20,
        zIndex: 1000,
        borderRadius: "8px",
        overflow: "hidden",
        width: expanded ? "280px" : "50px",
        transition: "width 0.3s ease",
      }}
    >
      {/* 摺疊按鈕 */}
      <Box
        sx={{
          p: 1,
          backgroundColor: "#1976d2",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: expanded ? "space-between" : "center",
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <LayersIcon fontSize="small" />
            <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
              {i18n.language === "zh" ? "圖層控制" : "Layers"}
            </Typography>
          </Box>
        )}
        {!expanded && <LayersIcon fontSize="small" />}
        <IconButton size="small" sx={{ color: "white" }}>
          {expanded ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      {/* 圖層列表 */}
      {expanded && (
        <Box sx={{ p: 2, maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
          <LayerItem id="sst" icon="🌊" defaultOn />
          <Divider sx={{ my: 1 }} />
          <LayerItem id="lst" icon="🏔️" defaultOn />
          <Divider sx={{ my: 1 }} />
          <LayerItem id="ocean_current" icon="🌀" />
          <Divider sx={{ my: 1 }} />
          <LayerItem id="wind" icon="💨" />
          <Divider sx={{ my: 1 }} />
          <LayerItem id="waves" icon="🌊" />
          <Divider sx={{ my: 1 }} />
          <LayerItem id="chlorophyll" icon="🟢" />

          {/* 說明 */}
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              backgroundColor: "#f5f5f5",
              borderRadius: "6px",
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontSize: "10px", color: "#666" }}
            >
              {i18n.language === "zh"
                ? "💡 提示：海表溫度和陸地溫度預設開啟"
                : "💡 Tip: SST & LST enabled by default"}
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default LayerControl;

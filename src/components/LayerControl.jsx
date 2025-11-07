import { useState } from "react";
import {
  Box,
  Typography,
  Switch,
  Slider,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import LayersIcon from "@mui/icons-material/Layers";

const LayerControl = ({ onLayerChange }) => {
  const { i18n } = useTranslation();
  const [layers, setLayers] = useState({
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
    <Box
      sx={{
        width: "100%",
        height: "100%",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          backgroundColor: "#1976d2",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <LayersIcon fontSize="small" />
        <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
          Layer Controls
        </Typography>
      </Box>

      {/* 圖層列表 */}
      <Box sx={{ p: 2, maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
        <LayerItem id="sst" icon="🌊" />
        <Divider sx={{ my: 1 }} />
        <LayerItem id="lst" icon="🏔️" />
        <Divider sx={{ my: 1 }} />
        <LayerItem id="ocean_current" icon="🌀" />
        <Divider sx={{ my: 1 }} />
        <LayerItem id="wind" icon="💨" />
        <Divider sx={{ my: 1 }} />
        <LayerItem id="waves" icon="☁️" />
        <Divider sx={{ my: 1 }} />
        <LayerItem id="chlorophyll" icon="🌡️" />
      </Box>
    </Box>
  );
};

export default LayerControl;

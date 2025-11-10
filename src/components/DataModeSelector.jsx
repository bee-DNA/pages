import { Box } from "@mui/material";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

/**
 * 資料模式選擇器
 * 提供三個按鈕：即時、搜尋、日期
 */
const DataModeSelector = ({ currentMode, onModeChange }) => {
  const { t } = useTranslation();

  const modes = [
    { id: "live", label: t("map.dataMode.live") },
    { id: "search", label: t("map.dataMode.search") },
    { id: "date", label: t("map.dataMode.date") },
  ];

  return (
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
      {modes.map((mode, index) => (
        <Box
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          sx={{
            position: "relative",
            zIndex: 1,
            padding: "6px 14px",
            borderRadius: "17px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600,
            color: currentMode === mode.id ? "white" : "#666",
            transition: "color 0.2s",
            userSelect: "none",
            "&:hover": {
              backgroundColor:
                currentMode === mode.id ? "transparent" : "rgba(0, 0, 0, 0.05)",
            },
          }}
        >
          {mode.label}
        </Box>
      ))}

      {/* 滑動背景 */}
      <Box
        sx={{
          position: "absolute",
          top: "3px",
          left:
            currentMode === "live"
              ? "3px"
              : currentMode === "search"
              ? "33.33%"
              : "66.66%",
          width: "calc(33.33% - 2px)",
          height: "calc(100% - 6px)",
          backgroundColor: "#1976d2",
          borderRadius: "17px",
          transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 0,
        }}
      />
    </Box>
  );
};

DataModeSelector.propTypes = {
  currentMode: PropTypes.oneOf(["live", "search", "date"]).isRequired,
  onModeChange: PropTypes.func.isRequired,
};

export default DataModeSelector;

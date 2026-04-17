import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  Paper,
  Chip,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const TimeController = ({ projectId = "BEE001" }) => {
  const { i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [currentTime] = useState(
    new Date().toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  );

  return (
    <Paper
      elevation={3}
      sx={{
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 1000,
        borderRadius: "8px",
        overflow: "hidden",
        minWidth: expanded ? "320px" : "280px",
        transition: "all 0.3s ease",
      }}
    >
      {/* 收合狀態顯示 */}
      <Box
        sx={{
          p: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#1976d2",
          color: "white",
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccessTimeIcon fontSize="small" />
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontSize: "13px" }}
            >
              {i18n.language === "zh"
                ? "即時資料 / 今日數據"
                : "Live Data / Today's Data"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontSize: "11px", opacity: 0.9 }}
            >
              {currentTime}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" sx={{ color: "white" }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* 展開後顯示專案資訊 */}
      <Collapse in={expanded}>
        <Box sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
          {/* 專案編號 */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{ color: "#666", fontSize: "11px" }}
            >
              {i18n.language === "zh" ? "專案編號" : "Project ID"}
            </Typography>
            <Chip
              label={projectId}
              size="small"
              sx={{
                mt: 0.5,
                fontWeight: 600,
                backgroundColor: "#FF6B6B",
                color: "white",
              }}
            />
          </Box>

          {/* 數據說明 */}
          <Box
            sx={{
              p: 1.5,
              backgroundColor: "white",
              borderRadius: "6px",
              border: "1px solid #e0e0e0",
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontSize: "12px", color: "#666", mb: 1 }}
            >
              {i18n.language === "zh" ? "📊 數據更新" : "📊 Data Update"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontSize: "11px", color: "#999" }}
            >
              {i18n.language === "zh"
                ? "每 3 小時更新一次（今日數據）"
                : "Updated every 3 hours (Today's data)"}
            </Typography>
          </Box>

          {/* 提示 */}
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1.5,
              fontSize: "10px",
              color: "#999",
              fontStyle: "italic",
            }}
          >
            {i18n.language === "zh"
              ? "💡 歷史數據回溯功能開發中..."
              : "💡 Historical data feature coming soon..."}
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default TimeController;

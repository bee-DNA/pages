import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PropTypes from "prop-types";

/**
 * 樣本搜尋對話框
 * 支援樣本 ID 搜尋 (EB0001 → 2024-11-01, EB0002 → 2024-11-02)
 */
const SampleSearchDialog = ({ open, onClose, onSearch }) => {
  const [sampleId, setSampleId] = useState("");
  const [error, setError] = useState("");

  // 樣本 ID 到日期的映射
  const sampleDateMap = {
    EB0001: "2024-11-01",
    EB0002: "2024-11-02",
  };

  const handleSearch = () => {
    const normalizedId = sampleId.trim().toUpperCase();

    if (!normalizedId) {
      setError("請輸入樣本 ID");
      return;
    }

    const date = sampleDateMap[normalizedId];
    if (!date) {
      setError(`找不到樣本 ${normalizedId}，目前支援：EB0001, EB0002`);
      return;
    }

    // 清除錯誤並執行搜尋
    setError("");
    onSearch(date);
    handleClose();
  };

  const handleClose = () => {
    setSampleId("");
    setError("");
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SearchIcon color="primary" />
          <span>樣本搜尋</span>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="樣本 ID"
            placeholder="例如：EB0001"
            value={sampleId}
            onChange={(e) => setSampleId(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            helperText="輸入樣本編號以查看該日期的氣象資料"
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              可用樣本：
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • EB0001 → 2024-11-01
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • EB0002 → 2024-11-02
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button
          onClick={handleSearch}
          variant="contained"
          startIcon={<SearchIcon />}
        >
          搜尋
        </Button>
      </DialogActions>
    </Dialog>
  );
};

SampleSearchDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default SampleSearchDialog;

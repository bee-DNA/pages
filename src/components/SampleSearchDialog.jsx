import { useState, useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PropTypes from "prop-types";
import { api } from "../services/api";

/**
 * 樣本搜尋對話框
 * 從後端 API 動態獲取樣本資料
 */
const SampleSearchDialog = ({ open, onClose, onSearch }) => {
  const [sampleId, setSampleId] = useState("");
  const [error, setError] = useState("");
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);

  // 從後端獲取樣本列表
  useEffect(() => {
    const fetchSamples = async () => {
      if (!open) return;

      setLoading(true);
      try {
        const data = await api.getSamples(1, 100); // 獲取前100個樣本
        if (data.samples && data.samples.length > 0) {
          setSamples(data.samples);
        }
      } catch (err) {
        console.error("Failed to fetch samples:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSamples();
  }, [open]);

  const handleSearch = () => {
    const normalizedId = sampleId.trim().toUpperCase();

    if (!normalizedId) {
      setError("請輸入樣本 ID");
      return;
    }

    // 在樣本列表中查找
    const sample = samples.find(
      (s) => s.sample_id.toUpperCase() === normalizedId
    );

    if (!sample) {
      const availableIds = samples
        .slice(0, 5)
        .map((s) => s.sample_id)
        .join(", ");
      setError(
        `找不到樣本 ${normalizedId}${
          availableIds ? `，可用樣本：${availableIds}...` : ""
        }`
      );
      return;
    }

    // 使用樣本的採集日期
    const date = sample.collection_date;
    if (!date) {
      setError(`樣本 ${normalizedId} 沒有採集日期資料`);
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
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ pt: 2 }}>
            <TextField
              autoFocus
              fullWidth
              label="樣本 ID"
              placeholder="例如：BEE001"
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

            {samples.length > 0 && (
              <Box sx={{ mt: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  可用樣本範例：
                </Typography>
                {samples.slice(0, 5).map((sample) => (
                  <Typography
                    key={sample.sample_id}
                    variant="body2"
                    color="text.secondary"
                  >
                    • {sample.sample_id} → {sample.collection_date} (
                    {sample.location})
                  </Typography>
                ))}
                {samples.length > 5 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    ... 及其他 {samples.length - 5} 個樣本
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button
          onClick={handleSearch}
          variant="contained"
          startIcon={<SearchIcon />}
          disabled={loading}
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

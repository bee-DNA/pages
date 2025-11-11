import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import dayjs from "dayjs";
import "dayjs/locale/zh-tw";
import PropTypes from "prop-types";
import { api } from "../services/api";

/**
 * 日期選擇器對話框
 * 從後端 API 動態獲取可用日期
 */
const DatePickerDialog = ({ open, onClose, onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 從後端獲取配置
  useEffect(() => {
    const fetchConfig = async () => {
      if (!open) return;

      setLoading(true);
      setError(null);

      try {
        const config = await api.getConfig();
        const dates = config.features?.date_ranges || [];

        if (dates.length === 0) {
          setError("後端沒有可用的日期資料");
          return;
        }

        // 轉換為 dayjs 物件
        const dayjsDates = dates.map((d) => dayjs(d));
        setAvailableDates(dayjsDates);

        // 設定預設選擇第一個日期
        if (!selectedDate) {
          setSelectedDate(dayjsDates[0]);
        }
      } catch (err) {
        console.error("Failed to fetch config:", err);
        setError("無法載入可用日期");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [open]);

  // 檢查日期是否可用
  const shouldDisableDate = (date) => {
    return !availableDates.some((availableDate) =>
      availableDate.isSame(date, "day")
    );
  };

  const handleConfirm = () => {
    if (selectedDate) {
      onDateSelect(selectedDate.format("YYYY-MM-DD"));
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  // 計算日期範圍
  const minDate = availableDates.length > 0 ? availableDates[0] : null;
  const maxDate =
    availableDates.length > 0
      ? availableDates[availableDates.length - 1]
      : null;
  const defaultMonth = availableDates.length > 0 ? availableDates[0] : dayjs();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarTodayIcon color="primary" />
          <span>選擇日期</span>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : (
          <Box sx={{ pt: 2 }}>
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale="zh-tw"
            >
              <DatePicker
                label="選擇日期"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                shouldDisableDate={shouldDisableDate}
                views={["year", "month", "day"]}
                openTo="day"
                defaultCalendarMonth={defaultMonth}
                minDate={minDate}
                maxDate={maxDate}
                disabled={availableDates.length === 0}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText:
                      availableDates.length > 0
                        ? `可用日期: ${availableDates
                            .map((d) => d.format("YYYY-MM-DD"))
                            .join(", ")}`
                        : "無可用日期",
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedDate || loading}
        >
          確認
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DatePickerDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDateSelect: PropTypes.func.isRequired,
};

export default DatePickerDialog;

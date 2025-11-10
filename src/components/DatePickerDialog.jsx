import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import dayjs from "dayjs";
import "dayjs/locale/zh-tw";
import PropTypes from "prop-types";

/**
 * 日期選擇器對話框
 * 只允許選擇有資料的日期（2024-11-01, 2024-11-02）
 */
const DatePickerDialog = ({ open, onClose, onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  // 有資料的日期
  const availableDates = [dayjs("2024-11-01"), dayjs("2024-11-02")];

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
    setSelectedDate(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarTodayIcon color="primary" />
          <span>選擇日期</span>
        </Box>
      </DialogTitle>

      <DialogContent>
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
              minDate={dayjs("2024-11-01")}
              maxDate={dayjs("2024-11-02")}
              slotProps={{
                textField: {
                  fullWidth: true,
                  helperText: "僅顯示有氣象資料的日期",
                },
              }}
            />
          </LocalizationProvider>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedDate}
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

import { Box, Paper, IconButton, Slider, Typography, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { formatTimestamp } from '../hooks/useTimelineAnimation';

const TimelineControls = ({
  currentFrame,
  totalFrames,
  isPlaying,
  timestamp,
  onPlay,
  onPause,
  onStop,
  onNext,
  onPrevious,
  onFrameChange,
}) => {
  const handleSliderChange = (event, newValue) => {
    onFrameChange(newValue);
  };

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        borderRadius: 3,
        p: 2,
        minWidth: { xs: '90%', sm: 480, md: 600 },
        maxWidth: 800,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* 時間顯示 */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccessTimeIcon sx={{ color: '#1976d2', fontSize: 20 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
          {timestamp ? formatTimestamp(timestamp, 'full') : '載入中...'}
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="caption" sx={{ color: '#666', fontSize: 11 }}>
            幀: {currentFrame + 1} / {totalFrames}
          </Typography>
        </Box>
      </Box>

      {/* 時間軸滑桿 */}
      <Box sx={{ px: 1, mb: 2 }}>
        <Slider
          value={currentFrame}
          min={0}
          max={totalFrames - 1}
          step={1}
          onChange={handleSliderChange}
          marks={Array.from({ length: totalFrames }, (_, i) => ({
            value: i,
            label: i % 4 === 0 ? `${i * 3}h` : '',
          }))}
          sx={{
            '& .MuiSlider-thumb': {
              backgroundColor: '#1976d2',
              width: 16,
              height: 16,
              '&:hover': {
                boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)',
              },
            },
            '& .MuiSlider-track': {
              backgroundColor: '#1976d2',
              height: 4,
            },
            '& .MuiSlider-rail': {
              backgroundColor: '#e0e0e0',
              height: 4,
            },
            '& .MuiSlider-mark': {
              backgroundColor: '#bfbfbf',
              height: 8,
              width: 2,
            },
            '& .MuiSlider-markLabel': {
              fontSize: 10,
              color: '#666',
            },
          }}
        />
      </Box>

      {/* 控制按鈕 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <Tooltip title="停止">
          <IconButton
            onClick={onStop}
            size="small"
            sx={{
              backgroundColor: '#f5f5f5',
              '&:hover': { backgroundColor: '#e0e0e0' },
            }}
          >
            <StopIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="上一幀">
          <IconButton
            onClick={onPrevious}
            size="small"
            sx={{
              backgroundColor: '#f5f5f5',
              '&:hover': { backgroundColor: '#e0e0e0' },
            }}
          >
            <SkipPreviousIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={isPlaying ? '暫停' : '播放'}>
          <IconButton
            onClick={isPlaying ? onPause : onPlay}
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              width: 48,
              height: 48,
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="下一幀">
          <IconButton
            onClick={onNext}
            size="small"
            sx={{
              backgroundColor: '#f5f5f5',
              '&:hover': { backgroundColor: '#e0e0e0' },
            }}
          >
            <SkipNextIcon />
          </IconButton>
        </Tooltip>

        <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography variant="caption" sx={{ color: '#666', fontSize: 10 }}>
            動畫時長
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', fontSize: 13 }}>
            5 秒循環
          </Typography>
        </Box>
      </Box>

      {/* 進度條 */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" sx={{ color: '#666', fontSize: 10 }}>
            2024-11-01 00:00
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', fontSize: 10 }}>
            2024-11-02 21:00
          </Typography>
        </Box>
        <Box
          sx={{
            width: '100%',
            height: 4,
            backgroundColor: '#e0e0e0',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${((currentFrame + 1) / totalFrames) * 100}%`,
              height: '100%',
              backgroundColor: '#1976d2',
              transition: 'width 0.2s ease',
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default TimelineControls;

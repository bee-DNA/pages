import { useState, useEffect, useRef, useCallback } from "react";

/**
 * 時間軸動畫 Hook
 * 用於控制氣象圖層的時間序列動畫
 *
 * @param {Object} options
 * @param {number} options.totalFrames - 總幀數（預設16：2天×8時間點）
 * @param {number} options.duration - 動畫總時長（毫秒，預設5000）
 * @param {boolean} options.autoPlay - 是否自動播放（預設false）
 * @param {boolean} options.loop - 是否循環播放（預設true）
 * @returns {Object} 動畫控制物件
 */
export const useTimelineAnimation = ({
  totalFrames = 16,
  duration = 5000,
  autoPlay = false,
  loop = true,
} = {}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [timestamp, setTimestamp] = useState(null);

  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const frameTimeRef = useRef(duration / totalFrames);

  // 計算每幀時間
  useEffect(() => {
    frameTimeRef.current = duration / totalFrames;
  }, [duration, totalFrames]);

  // 動畫循環
  const animate = useCallback(
    (time) => {
      if (!startTimeRef.current) {
        startTimeRef.current = time;
      }

      const elapsed = time - startTimeRef.current;
      const progress = elapsed / duration;

      if (progress >= 1) {
        if (loop) {
          // 循環播放
          startTimeRef.current = time;
          setCurrentFrame(0);
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // 停止在最後一幀
          setCurrentFrame(totalFrames - 1);
          setIsPlaying(false);
          animationRef.current = null;
        }
      } else {
        // 計算當前幀
        const frame = Math.floor(progress * totalFrames);
        setCurrentFrame(frame);
        animationRef.current = requestAnimationFrame(animate);
      }
    },
    [duration, totalFrames, loop]
  );

  // 控制播放/暫停
  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = null;
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animate]);

  // 生成時間戳記（基於2024-11-01 00:00:00，每3小時一個點）
  useEffect(() => {
    const baseTime = new Date("2024-11-01T00:00:00+08:00");
    const hoursOffset = currentFrame * 3; // 每3小時一個時間點
    const frameTime = new Date(
      baseTime.getTime() + hoursOffset * 60 * 60 * 1000
    );
    setTimestamp(frameTime);
  }, [currentFrame]);

  // 控制函數
  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentFrame(0);
    startTimeRef.current = null;
  }, []);

  const goToFrame = useCallback(
    (frame) => {
      const validFrame = Math.max(0, Math.min(frame, totalFrames - 1));
      setCurrentFrame(validFrame);
      setIsPlaying(false);
      startTimeRef.current = null;
    },
    [totalFrames]
  );

  const nextFrame = useCallback(() => {
    setCurrentFrame((prev) => {
      const next = prev + 1;
      return next >= totalFrames ? (loop ? 0 : prev) : next;
    });
  }, [totalFrames, loop]);

  const previousFrame = useCallback(() => {
    setCurrentFrame((prev) => {
      const next = prev - 1;
      return next < 0 ? (loop ? totalFrames - 1 : 0) : next;
    });
  }, [totalFrames, loop]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  return {
    currentFrame,
    totalFrames,
    isPlaying,
    timestamp,
    progress: currentFrame / (totalFrames - 1),

    // 控制方法
    play,
    pause,
    stop,
    togglePlayPause,
    goToFrame,
    nextFrame,
    previousFrame,
  };
};

/**
 * 格式化時間戳記
 * @param {Date} timestamp
 * @param {string} format - 'full' | 'date' | 'time' | 'datetime'
 * @returns {string}
 */
export const formatTimestamp = (timestamp, format = "datetime") => {
  if (!timestamp) return "";

  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Taipei",
  };

  switch (format) {
    case "date":
      return timestamp.toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Taipei",
      });
    case "time":
      return timestamp.toLocaleTimeString("zh-TW", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Taipei",
      });
    case "full":
      return timestamp.toLocaleString("zh-TW", {
        ...options,
        weekday: "short",
      });
    case "datetime":
    default:
      return timestamp.toLocaleString("zh-TW", options);
  }
};

// Default export
export default useTimelineAnimation;

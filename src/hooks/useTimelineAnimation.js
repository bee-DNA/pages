import { useState, useEffect, useRef, useCallback } from "react";
import api from "../services/api";

/**
 * 時間軸動畫 Hook
 * 用於控制氣象圖層的時間序列動畫
 * 自動從後端 API 讀取可用日期範圍
 *
 * @param {Object} options
 * @param {number} options.totalFrames - 總幀數（預設48：2天×24小時）
 * @param {number} options.duration - 動畫總時長（毫秒，預設5000）
 * @param {boolean} options.autoPlay - 是否自動播放（預設false）
 * @param {boolean} options.loop - 是否循環播放（預設true）
 * @returns {Object} 動畫控制物件
 */
export const useTimelineAnimation = ({
  totalFrames = 48,
  duration = 5000,
  autoPlay = false,
  loop = true,
} = {}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [timestamp, setTimestamp] = useState(null);
  const [datesMetadata, setDatesMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const frameTimeRef = useRef(duration / totalFrames);

  // 從 API 讀取日期 metadata
  useEffect(() => {
    const fetchDatesMetadata = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${api.API_URL}/tiles/meta/dates`);
        
        if (response.ok) {
          const data = await response.json();
          setDatesMetadata(data);
          console.log("[useTimelineAnimation] 已載入日期 metadata:", data);
        } else {
          // 如果 API 失敗,使用預設值(向後兼容)
          console.warn("[useTimelineAnimation] 無法載入日期 metadata,使用預設值");
          setDatesMetadata({
            dates: [
              {
                date: "2023-01-01",
                frameStart: 0,
                frameEnd: 23,
                hours: 24,
                timezone: "UTC+8"
              },
              {
                date: "2024-05-05",
                frameStart: 24,
                frameEnd: 47,
                hours: 24,
                timezone: "UTC+8"
              }
            ],
            totalFrames: 48,
            hoursPerDay: 24
          });
        }
      } catch (error) {
        console.error("[useTimelineAnimation] 載入日期 metadata 失敗:", error);
        // 使用預設值
        setDatesMetadata({
          dates: [
            {
              date: "2023-01-01",
              frameStart: 0,
              frameEnd: 23,
              hours: 24,
              timezone: "UTC+8"
            },
            {
              date: "2024-05-05",
              frameStart: 24,
              frameEnd: 47,
              hours: 24,
              timezone: "UTC+8"
            }
          ],
          totalFrames: 48,
          hoursPerDay: 24
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatesMetadata();
  }, []);

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

  // 生成時間戳記(基於從 API 讀取的日期)
  useEffect(() => {
    if (!datesMetadata) return;

    // 找到當前 frame 對應的日期
    const dateInfo = datesMetadata.dates.find(
      (d) => currentFrame >= d.frameStart && currentFrame <= d.frameEnd
    );

    if (dateInfo) {
      // 計算該日期內的小時偏移
      const hoursOffset = currentFrame - dateInfo.frameStart;
      const baseTime = new Date(dateInfo.date + "T00:00:00+08:00");
      const frameTime = new Date(
        baseTime.getTime() + hoursOffset * 60 * 60 * 1000
      );
      setTimestamp(frameTime);
    } else {
      // Fallback: 使用舊邏輯
      const baseTime =
        currentFrame < 24
          ? new Date("2023-01-01T00:00:00+08:00")
          : new Date("2024-05-05T00:00:00+08:00");
      const hoursOffset = currentFrame < 24 ? currentFrame : currentFrame - 24;
      const frameTime = new Date(
        baseTime.getTime() + hoursOffset * 60 * 60 * 1000
      );
      setTimestamp(frameTime);
    }
  }, [currentFrame, datesMetadata]);

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
    datesMetadata,
    isLoading,
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

import {
  Box,
  Typography,
  Container,
  Paper,
  CircularProgress,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import PageHeader from "../components/PageHeader";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FilterListIcon from "@mui/icons-material/FilterList";
import BiotechIcon from "@mui/icons-material/Biotech";
import GridViewIcon from "@mui/icons-material/GridView";
import TableRowsIcon from "@mui/icons-material/TableRows";

// 圓餅圖組件
const PieChart = ({ data, colors }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90; // 從頂部開始

  return (
    <Box
      sx={{ position: "relative", width: 160, height: 160, margin: "0 auto" }}
    >
      <svg width="160" height="160" viewBox="0 0 160 160">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;

          const x1 = 80 + 70 * Math.cos((startAngle * Math.PI) / 180);
          const y1 = 80 + 70 * Math.sin((startAngle * Math.PI) / 180);
          const x2 = 80 + 70 * Math.cos((endAngle * Math.PI) / 180);
          const y2 = 80 + 70 * Math.sin((endAngle * Math.PI) / 180);

          const largeArcFlag = angle > 180 ? 1 : 0;

          const pathData = [
            `M 80 80`,
            `L ${x1} ${y1}`,
            `A 70 70 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `Z`,
          ].join(" ");

          currentAngle = endAngle;

          return (
            <path
              key={index}
              d={pathData}
              fill={colors[index % colors.length]}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
        {/* 中心白色圓 */}
        <circle cx="80" cy="80" r="50" fill="white" />
      </svg>
      {/* 中心文字 */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1976d2" }}>
          100%
        </Typography>
        <Typography variant="caption" sx={{ color: "#666" }}>
          Total
        </Typography>
      </Box>
    </Box>
  );
};

// 樣品卡片組件
const SampleCard = ({ sample, bacteriaColors }) => {
  const bacteria = sample.bacteria || [];

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          transform: "translateY(-4px)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* 樣品名稱 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
            pb: 2,
            borderBottom: "2px solid #f0f0f0",
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              backgroundColor: "#1976d2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: "18px",
            }}
          >
            {sample.id || "1"}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {sample.name || "NCUE"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#666" }}>
              Sampling Point
            </Typography>
          </Box>
        </Box>

        {/* 圓餅圖 */}
        <Box sx={{ my: 2 }}>
          <PieChart data={bacteria} colors={bacteriaColors} />
        </Box>

        {/* 菌種列表 */}
        <Box sx={{ mt: 2 }}>
          {bacteria.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: "4px",
                    backgroundColor:
                      bacteriaColors[index % bacteriaColors.length],
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {item.name}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: bacteriaColors[index % bacteriaColors.length],
                }}
              >
                {item.percentage}%
              </Typography>
            </Box>
          ))}
        </Box>

        {/* 其他資訊 */}
        {sample.location && (
          <Chip
            icon={<LocationOnIcon />}
            label={sample.location}
            size="small"
            sx={{ mt: 2, mr: 1 }}
          />
        )}
        {sample.date && (
          <Chip
            icon={<CalendarTodayIcon />}
            label={sample.date}
            size="small"
            sx={{ mt: 2 }}
          />
        )}
      </CardContent>
    </Card>
  );
};

const Search = () => {
  const { t } = useTranslation();
  const [rawData, setRawData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterBacteria, setFilterBacteria] = useState("all");
  const [viewMode, setViewMode] = useState("cards"); // "cards" 或 "table"

  // 菌種顏色配置
  const bacteriaColors = [
    "#1976d2",
    "#ff9800",
    "#4caf50",
    "#f44336",
    "#9c27b0",
  ];

  useEffect(() => {
    const loadExcelData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 從 public/search-data/ 讀取測試數據
        const response = await fetch("/search-data/測試數據.xlsx");
        if (!response.ok) {
          throw new Error("無法載入測試數據");
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        // 讀取第一個工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 轉換為 JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length > 0) {
          setHeaders(jsonData[0]);
          setRawData(jsonData.slice(1));
        }
      } catch (err) {
        console.error("載入Excel檔案錯誤:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadExcelData();
  }, []);

  // 將原始資料轉換為結構化樣品資料
  const samples = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];

    // 假設資料格式: [ID, Name, Location, Date, Bacteria1, Percentage1, Bacteria2, Percentage2, ...]
    return rawData.map((row, index) => {
      const bacteria = [];

      // 提取菌種和百分比 (從第5列開始,每2列一組)
      for (let i = 4; i < row.length; i += 2) {
        if (row[i] && row[i + 1]) {
          bacteria.push({
            name: String(row[i]),
            value: parseFloat(row[i + 1]) || 0,
            percentage: (parseFloat(row[i + 1]) || 0).toFixed(2),
          });
        }
      }

      return {
        id: row[0] || index + 1,
        name: row[1] || `Sample ${index + 1}`,
        location: row[2] || "",
        date: row[3] || "",
        bacteria: bacteria,
      };
    });
  }, [rawData]);

  // 篩選後的資料
  const filteredSamples = useMemo(() => {
    return samples.filter((sample) => {
      // 搜尋過濾
      const matchesSearch =
        searchQuery === "" ||
        sample.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sample.location.toLowerCase().includes(searchQuery.toLowerCase());

      // 地點過濾
      const matchesLocation =
        filterLocation === "all" || sample.location === filterLocation;

      // 菌種過濾
      const matchesBacteria =
        filterBacteria === "all" ||
        sample.bacteria.some((b) => b.name === filterBacteria);

      return matchesSearch && matchesLocation && matchesBacteria;
    });
  }, [samples, searchQuery, filterLocation, filterBacteria]);

  // 獲取所有唯一的地點
  const locations = useMemo(() => {
    const locs = new Set(samples.map((s) => s.location).filter(Boolean));
    return Array.from(locs);
  }, [samples]);

  // 獲取所有唯一的菌種
  const allBacteria = useMemo(() => {
    const bacteria = new Set();
    samples.forEach((sample) => {
      sample.bacteria.forEach((b) => bacteria.add(b.name));
    });
    return Array.from(bacteria);
  }, [samples]);

  return (
    <Container maxWidth={false} disableGutters sx={{ py: 4, px: 3 }}>
      <Box sx={{ width: "100%" }}>
        <PageHeader
          icon={<ManageSearchIcon sx={{ fontSize: 28, color: "#1976d2" }} />}
          title={t("nav.search")}
          subtitle="Advanced Sample Search & Filter"
        />

        <Box
          sx={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            minHeight: "calc(100vh - 250px)",
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "300px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography variant="body1" sx={{ color: "error.main" }}>
              錯誤: {error}
            </Typography>
          ) : (
            <>
              {/* 搜尋和篩選區域 */}
              <Box sx={{ mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                  {/* 搜尋框 */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      placeholder="搜尋樣品名稱或地點..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        },
                      }}
                    />
                  </Grid>

                  {/* 地點篩選 */}
                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>地點</InputLabel>
                      <Select
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value)}
                        label="地點"
                        sx={{ borderRadius: "12px" }}
                      >
                        <MenuItem value="all">所有地點</MenuItem>
                        {locations.map((loc) => (
                          <MenuItem key={loc} value={loc}>
                            {loc}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* 菌種篩選 */}
                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>菌種</InputLabel>
                      <Select
                        value={filterBacteria}
                        onChange={(e) => setFilterBacteria(e.target.value)}
                        label="菌種"
                        sx={{ borderRadius: "12px" }}
                      >
                        <MenuItem value="all">所有菌種</MenuItem>
                        {allBacteria.map((bacteria) => (
                          <MenuItem key={bacteria} value={bacteria}>
                            {bacteria}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* 視圖切換按鈕 */}
                  <Grid item xs={12} sm={6} md={2}>
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={(e, newMode) => {
                        if (newMode !== null) {
                          setViewMode(newMode);
                        }
                      }}
                      fullWidth
                      sx={{
                        "& .MuiToggleButton-root": {
                          borderRadius: "12px",
                          "&.Mui-selected": {
                            backgroundColor: "#1976d2",
                            color: "white",
                            "&:hover": {
                              backgroundColor: "#1565c0",
                            },
                          },
                        },
                      }}
                    >
                      <ToggleButton value="cards" aria-label="卡片視圖">
                        <Tooltip title="卡片視圖">
                          <GridViewIcon />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="table" aria-label="表格視圖">
                        <Tooltip title="表格視圖">
                          <TableRowsIcon />
                        </Tooltip>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Grid>

                  {/* 結果統計 */}
                  <Grid item xs={12} sm={6} md={2}>
                    <Box
                      sx={{
                        textAlign: { xs: "left", md: "right" },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: { xs: "flex-start", md: "flex-end" },
                        gap: 1,
                      }}
                    >
                      <BiotechIcon sx={{ color: "#1976d2" }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {filteredSamples.length} 筆樣品
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* 樣品卡片網格 */}
              {filteredSamples.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                  }}
                >
                  <SearchIcon sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
                  <Typography variant="h6" sx={{ color: "#666", mb: 1 }}>
                    找不到符合條件的樣品
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#999" }}>
                    請嘗試調整搜尋條件或篩選器
                  </Typography>
                </Box>
              ) : viewMode === "cards" ? (
                /* 卡片視圖 */
                <Grid container spacing={3}>
                  {filteredSamples.map((sample, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                      <SampleCard
                        sample={sample}
                        bacteriaColors={bacteriaColors}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                /* 表格視圖 */
                <Box sx={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "14px",
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: "#f5f5f5" }}>
                        {headers.map((header, index) => (
                          <th
                            key={index}
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              borderBottom: "2px solid #ddd",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rawData
                        .filter((row, rowIndex) => {
                          const sample = samples[rowIndex];
                          if (!sample) return false;

                          const matchesSearch =
                            searchQuery === "" ||
                            sample.name
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            sample.location
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase());

                          const matchesLocation =
                            filterLocation === "all" ||
                            sample.location === filterLocation;

                          const matchesBacteria =
                            filterBacteria === "all" ||
                            sample.bacteria.some(
                              (b) => b.name === filterBacteria
                            );

                          return (
                            matchesSearch && matchesLocation && matchesBacteria
                          );
                        })
                        .map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            style={{
                              backgroundColor:
                                rowIndex % 2 === 0 ? "white" : "#fafafa",
                            }}
                          >
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                style={{
                                  padding: "10px 12px",
                                  borderBottom: "1px solid #eee",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {cell !== null && cell !== undefined
                                  ? String(cell)
                                  : ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Search;

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DownloadSvg from "../assets/download.svg";
import CheckSvg from "../assets/check.svg";
import DnaSvg from "../assets/dna.svg";

const ResistanceTable = () => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 載入 CSV 數據
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/query-data/resistance-data.csv");
        if (!response.ok) {
          throw new Error("Failed to load data");
        }
        const text = await response.text();
        const lines = text.trim().split("\n");

        if (lines.length <= 1) {
          setData([]);
          setLoading(false);
          return;
        }

        const headers = lines[0].split(",");
        const parsedData = lines.slice(1).map((line) => {
          const values = line.split(",");
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });
          return row;
        });

        setData(parsedData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 抗生素分類和名稱
  const antibioticGroups = [
    {
      group: "1",
      name: "Aminoglycosides",
      nameCn: "氨基糖苷類",
      antibiotics: ["Tobramycin", "Streptomycin", "Amikacin"],
    },
    {
      group: "2",
      name: "Aminocyclitols",
      nameCn: "氨基環醇類",
      antibiotics: ["Spectinomycin"],
    },
    {
      group: "3",
      name: "Fluoroquinolones",
      nameCn: "氟喹諾酮類",
      antibiotics: ["Ciprofloxacin", "Nalidixic_acid"],
    },
    {
      group: "4",
      name: "Beta-lactams",
      nameCn: "β-內醯胺類",
      antibiotics: [
        "Amoxicillin",
        "Amoxicillin+Clavulanic_acid",
        "Ampicillin",
        "Ampicillin+Clavulanic_acid",
        "Cefepime",
        "Cefixime",
        "Cefotaxime",
        "Cefoxitin",
        "Ceftazidime",
        "Ertapenem",
        "Imipenem",
        "Meropenem",
        "Piperacillin",
        "Piperacillin+Tazobactam",
        "Ticarcillin",
        "Cephalothin",
      ],
    },
    {
      group: "5",
      name: "Diaminopyrimidines",
      nameCn: "二氨基嘧啶類",
      antibiotics: ["Trimethoprim"],
    },
    {
      group: "6",
      name: "Fosfomycin",
      nameCn: "磷黴素",
      antibiotics: ["Fosfomycin"],
    },
    {
      group: "13",
      name: "Phenicols",
      nameCn: "氯黴素類",
      antibiotics: ["Chloramphenicol"],
    },
    {
      group: "22",
      name: "Quaternary Ammonium",
      nameCn: "季銨化合物",
      antibiotics: ["Benzylkonium_Chloride", "Cetylpyridinium_Chloride"],
    },
  ];

  // 抗生素中文翻譯對照表
  const antibioticTranslations = {
    Tobramycin: "妥布黴素",
    Streptomycin: "鏈黴素",
    Amikacin: "阿米卡星",
    Spectinomycin: "壯觀黴素",
    Ciprofloxacin: "環丙沙星",
    Nalidixic_acid: "萘啶酸",
    Amoxicillin: "阿莫西林",
    "Amoxicillin+Clavulanic_acid": "阿莫西林+克拉維酸",
    Ampicillin: "氨苄西林",
    "Ampicillin+Clavulanic_acid": "氨苄西林+克拉維酸",
    Cefepime: "頭孢吡肟",
    Cefixime: "頭孢克肟",
    Cefotaxime: "頭孢噻肟",
    Cefoxitin: "頭孢西丁",
    Ceftazidime: "頭孢他啶",
    Ertapenem: "厄他培南",
    Imipenem: "亞胺培南",
    Meropenem: "美羅培南",
    Piperacillin: "哌拉西林",
    "Piperacillin+Tazobactam": "哌拉西林+他唑巴坦",
    Ticarcillin: "替卡西林",
    Cephalothin: "頭孢噻吩",
    Trimethoprim: "甲氧苄啶",
    Fosfomycin: "磷黴素",
    Chloramphenicol: "氯黴素",
    Benzylkonium_Chloride: "苯扎氯銨",
    Cetylpyridinium_Chloride: "西吡氯銨",
  };

  // 所有抗生素列表（扁平化）
  const allAntibiotics = antibioticGroups.flatMap((group) =>
    group.antibiotics.map((ab) => ({
      group: group.group,
      groupName: i18n.language === "zh" ? group.nameCn : group.name,
      name: ab,
      displayName:
        i18n.language === "zh" && antibioticTranslations[ab]
          ? antibioticTranslations[ab]
          : ab.replace(/_/g, " ").replace(/\+/g, "+"),
    }))
  );

  // 抗生素分組顏色
  const groupColors = {
    1: "#E8B4C8",
    2: "#FDB462",
    3: "#80B1D3",
    4: "#5F9EA0",
    5: "#B3DE69",
    6: "#FCCDE5",
    13: "#BC80BD",
    22: "#FFED6F",
  };

  // 下載表格數據
  const handleDownload = () => {
    fetch("/query-data/resistance-data.csv")
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "resistance-data.csv";
        link.click();
      });
  };

  // 載入中狀態
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {t("common.error")}: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* 標題區 */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img src={DnaSvg} alt="DNA" style={{ width: 24, height: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
            {t("query.title")}
          </Typography>
        </Box>
        <Tooltip title={t("common.download")}>
          <IconButton
            onClick={handleDownload}
            size="small"
            sx={{
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <img
              src={DownloadSvg}
              alt="download"
              style={{ width: 24, height: 24 }}
            />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 表格容器 */}
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: "calc(100vh - 220px)",
          maxWidth: "100%",
          overflow: "auto",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          borderRadius: "8px",
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth: 1000 }}>
          {/* 表頭 */}
          <TableHead>
            {/* 第一行：抗生素分組 */}
            <TableRow>
              <TableCell
                rowSpan={2}
                sx={{
                  backgroundColor: "#f5f5f5",
                  fontWeight: 700,
                  fontSize: "11px",
                  borderRight: "2px solid #e0e0e0",
                  position: "sticky",
                  left: 0,
                  zIndex: 3,
                  minWidth: 100,
                  padding: "6px 8px",
                }}
              >
                {t("query.resistanceGene")}
              </TableCell>
              <TableCell
                rowSpan={2}
                sx={{
                  backgroundColor: "#f5f5f5",
                  fontWeight: 700,
                  fontSize: "11px",
                  borderRight: "2px solid #e0e0e0",
                  position: "sticky",
                  left: 100,
                  zIndex: 3,
                  minWidth: 70,
                  textAlign: "center",
                  padding: "6px 8px",
                }}
              >
                {t("query.identity")}
              </TableCell>
              {antibioticGroups.map((group, index) => (
                <TableCell
                  key={index}
                  colSpan={group.antibiotics.length}
                  align="center"
                  sx={{
                    backgroundColor: groupColors[group.group] || "#e0e0e0",
                    fontWeight: 700,
                    fontSize: "10px",
                    color: "#333",
                    borderLeft: index > 0 ? "2px solid #fff" : "none",
                    padding: "6px 4px",
                  }}
                >
                  {group.group}.{" "}
                  {i18n.language === "zh" ? group.nameCn : group.name}
                </TableCell>
              ))}
            </TableRow>

            {/* 第二行：個別抗生素名稱（垂直顯示） */}
            <TableRow>
              {allAntibiotics.map((antibiotic, index) => (
                <TableCell
                  key={index}
                  align="center"
                  sx={{
                    backgroundColor: groupColors[antibiotic.group] || "#e0e0e0",
                    minWidth: 30,
                    maxWidth: 30,
                    padding: "6px 2px",
                    verticalAlign: "bottom",
                    borderLeft:
                      index > 0 &&
                      allAntibiotics[index - 1].group !== antibiotic.group
                        ? "2px solid #fff"
                        : "none",
                  }}
                >
                  <Box
                    sx={{
                      fontSize: "10px",
                      fontWeight: 500,
                      color: "#333",
                      height: "140px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* 判斷是否為中文 */}
                    {/[\u4e00-\u9fa5]/.test(antibiotic.displayName) ? (
                      // 中文：一個字一個字垂直排列
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          lineHeight: "1.5",
                        }}
                      >
                        {antibiotic.displayName.split("").map((char, idx) => (
                          <span key={idx}>{char}</span>
                        ))}
                      </Box>
                    ) : (
                      // 英文：整個單字旋轉
                      <Box
                        sx={{
                          writingMode: "vertical-rl",
                          transform: "rotate(180deg)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {antibiotic.displayName}
                      </Box>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* 表格內容 */}
          <TableBody>
            {data.length === 0
              ? // 顯示空白格子結構
                Array.from({ length: 8 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell
                      sx={{
                        fontSize: "11px",
                        padding: "12px 8px",
                        position: "sticky",
                        left: 0,
                        backgroundColor: "#fff",
                        borderRight: "2px solid #e0e0e0",
                        border: "1px solid #e0e0e0",
                        height: "50px",
                      }}
                    >
                      {/* 空白基因名稱 */}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: "11px",
                        padding: "12px 8px",
                        position: "sticky",
                        left: 100,
                        backgroundColor: "#fff",
                        borderRight: "2px solid #e0e0e0",
                        border: "1px solid #e0e0e0",
                        height: "50px",
                      }}
                    >
                      {/* 空白相似度 */}
                    </TableCell>
                    {allAntibiotics.map((antibiotic, colIndex) => (
                      <TableCell
                        key={colIndex}
                        align="center"
                        sx={{
                          fontSize: "11px",
                          padding: "12px 4px",
                          minWidth: 30,
                          maxWidth: 30,
                          backgroundColor: "#fafafa",
                          border: "1px solid #e8e8e8",
                          height: "50px",
                        }}
                      >
                        {/* 空白格子 */}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : // 顯示實際數據
                data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell
                      sx={{
                        fontSize: "10px",
                        padding: "8px",
                        position: "sticky",
                        left: 0,
                        backgroundColor: "#fff",
                        borderRight: "1px solid #e0e0e0",
                      }}
                    >
                      {row.gene}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: "10px",
                        padding: "8px",
                        position: "sticky",
                        left: 100,
                        backgroundColor: "#fff",
                        borderRight: "1px solid #e0e0e0",
                      }}
                    >
                      {row.identity}
                    </TableCell>
                    {allAntibiotics.map((antibiotic, colIndex) => (
                      <TableCell
                        key={colIndex}
                        align="center"
                        sx={{
                          fontSize: "10px",
                          padding: "8px",
                          minWidth: 30,
                          maxWidth: 30,
                        }}
                      >
                        {row[antibiotic.name] && (
                          <CheckCircleIcon
                            sx={{ fontSize: 14, color: "#4CAF50" }}
                          />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 說明文字 */}
      <Box
        sx={{
          mt: 2.5,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          <img src={CheckSvg} alt="check" style={{ width: 20, height: 20 }} />
          <Typography
            variant="body1"
            sx={{ color: "#444", fontSize: "15px", fontWeight: 500 }}
          >
            {i18n.language === "zh"
              ? "表示對該抗生素有抗藥性"
              : "Indicates resistance to the antibiotic"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ResistanceTable;

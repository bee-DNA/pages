import {
  Box,
  Typography,
  Container,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import PageHeader from "../components/PageHeader";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";

const Search = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          setHeaders(jsonData[0]); // 第一行作為標題
          setData(jsonData.slice(1)); // 其餘作為數據
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
                  {data.map((row, rowIndex) => (
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
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 2,
                  color: "#666",
                  textAlign: "right",
                }}
              >
                總計 {data.length} 筆數據
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Search;

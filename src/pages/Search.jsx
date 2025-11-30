import {
  Box,
  Typography,
  Container,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo } from "react";
import PageHeader from "../components/PageHeader";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

const Search = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOrganization, setFilterOrganization] = useState("all");
  const [filterCountry, setFilterCountry] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/biosample_enhanced.json");
        if (!response.ok) {
          throw new Error("Unable to load biosample data");
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error("Error loading JSON file:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 合併相同 SRA 編號的資料（_1 和 _2）
  const groupedData = useMemo(() => {
    const groups = new Map();

    data.forEach((item) => {
      const sra = item.SRA;
      if (!groups.has(sra)) {
        groups.set(sra, { ...item, files: [] });
      }
      groups.get(sra).files.push({
        完整檔名: item.完整檔名,
        檔案大小: item["檔案大小(MB)"],
      });
    });

    return Array.from(groups.values());
  }, [data]);

  // 篩選後的資料
  const filteredData = useMemo(() => {
    return groupedData.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        (item.sample_name &&
          item.sample_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.SRA &&
          item.SRA.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.BioSample &&
          item.BioSample.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.files &&
          item.files.some(
            (f) =>
              f.完整檔名 &&
              f.完整檔名.toLowerCase().includes(searchQuery.toLowerCase())
          ));

      const matchesOrganization =
        filterOrganization === "all" ||
        item.organization === filterOrganization;

      const matchesCountry =
        filterCountry === "all" ||
        (item.geo_loc_name && item.geo_loc_name.includes(filterCountry)) ||
        (item["geographic location (country and/or sea)"] &&
          item["geographic location (country and/or sea)"].includes(
            filterCountry
          ));

      return matchesSearch && matchesOrganization && matchesCountry;
    });
  }, [groupedData, searchQuery, filterOrganization, filterCountry]);

  // 獲取所有唯一的組織
  const organizations = useMemo(() => {
    const orgs = new Set(
      groupedData.map((s) => s.organization).filter(Boolean)
    );
    return Array.from(orgs).sort();
  }, [groupedData]);

  // 獲取所有唯一的國家
  const countries = useMemo(() => {
    const countrySet = new Set();
    groupedData.forEach((item) => {
      if (item.geo_loc_name) {
        const country = item.geo_loc_name.split(":")[0];
        if (country) countrySet.add(country);
      }
      if (item["geographic location (country and/or sea)"]) {
        countrySet.add(item["geographic location (country and/or sea)"]);
      }
    });
    return Array.from(countrySet).sort();
  }, [groupedData]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 當前頁面的資料
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  return (
    <Container maxWidth={false} disableGutters sx={{ py: 4, px: 3 }}>
      <Box sx={{ width: "100%" }}>
        <PageHeader
          icon={<ManageSearchIcon sx={{ fontSize: 28, color: "#1976d2" }} />}
          title={t("nav.search")}
          subtitle="BioSample Database Search & Filter"
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
              Error: {error}
            </Typography>
          ) : (
            <>
              {/* 搜尋和篩選區域 */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                  {/* Search Box */}
                  <TextField
                    sx={{ flex: "1 1 300px", minWidth: "250px" }}
                    placeholder="Search by SRA, BioSample, Sample Name, or Filename..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Organization Filter */}
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Organization</InputLabel>
                    <Select
                      value={filterOrganization}
                      onChange={(e) => setFilterOrganization(e.target.value)}
                      label="Organization"
                    >
                      <MenuItem value="all">All Organizations</MenuItem>
                      {organizations.map((org) => (
                        <MenuItem key={org} value={org}>
                          {org}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Country Filter */}
                  <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel>Country/Region</InputLabel>
                    <Select
                      value={filterCountry}
                      onChange={(e) => setFilterCountry(e.target.value)}
                      label="Country/Region"
                    >
                      <MenuItem value="all">All Countries</MenuItem>
                      {countries.map((country) => (
                        <MenuItem key={country} value={country}>
                          {country}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* 結果統計 */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FilterListIcon sx={{ color: "#1976d2" }} />
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Showing <strong>{filteredData.length}</strong> of{" "}
                    <strong>{groupedData.length}</strong> samples
                  </Typography>
                </Box>
              </Box>

              {/* 表格 */}
              {filteredData.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                  }}
                >
                  <SearchIcon sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
                  <Typography variant="h6" sx={{ color: "#666", mb: 1 }}>
                    No samples found
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#999" }}>
                    Try adjusting your search or filters
                  </Typography>
                </Box>
              ) : (
                <Paper sx={{ width: "100%", overflow: "hidden" }}>
                  <TableContainer sx={{ maxHeight: "calc(100vh - 450px)" }}>
                    <Table stickyHeader aria-label="biosample table">
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}
                          >
                            編號
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}
                          >
                            SRA
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}
                          >
                            完整檔名
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}
                            align="right"
                          >
                            檔案大小(MB)
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}
                          >
                            BioSample
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}
                          >
                            Sample Name
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}
                          >
                            Collection Date
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}
                          >
                            Location
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}
                          >
                            Organization
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}
                          >
                            Host
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedData.map((row, index) => (
                          <TableRow
                            key={index}
                            hover
                            sx={{
                              "&:nth-of-type(odd)": {
                                backgroundColor: "#fafafa",
                              },
                              cursor: "pointer",
                            }}
                          >
                            <TableCell>{row.編號 || "-"}</TableCell>
                            <TableCell>
                              <Chip
                                label={row.SRA || "-"}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell
                              sx={{
                                maxWidth: 300,
                                overflow: "hidden",
                              }}
                            >
                              {row.files && row.files.length > 0 ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 0.5,
                                  }}
                                >
                                  {row.files.map((file, idx) => (
                                    <Box
                                      key={idx}
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Chip
                                        label={`_${idx + 1}`}
                                        size="small"
                                        sx={{
                                          minWidth: 35,
                                          height: 20,
                                          fontSize: "0.7rem",
                                        }}
                                      />
                                      <Typography
                                        variant="body2"
                                        sx={{ fontSize: "0.875rem" }}
                                      >
                                        {file.完整檔名}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell align="right">
                              {row.files && row.files.length > 0 ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 0.5,
                                    alignItems: "flex-end",
                                  }}
                                >
                                  {row.files.map((file, idx) => (
                                    <Typography
                                      key={idx}
                                      variant="body2"
                                      sx={{ fontSize: "0.875rem" }}
                                    >
                                      {file.檔案大小
                                        ? parseFloat(
                                            file.檔案大小
                                          ).toLocaleString()
                                        : "-"}
                                    </Typography>
                                  ))}
                                </Box>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={row.BioSample || "-"}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell
                              sx={{
                                maxWidth: 250,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {row.sample_name || row.sample_title || "-"}
                            </TableCell>
                            <TableCell>
                              {row.collection_date ||
                                row["collection time"] ||
                                "-"}
                            </TableCell>
                            <TableCell
                              sx={{
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {row.geo_loc_name ||
                                row[
                                  "geographic location (region and locality)"
                                ] ||
                                "-"}
                            </TableCell>
                            <TableCell>{row.organization || "-"}</TableCell>
                            <TableCell
                              sx={{
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {row.host || row.scientific_name || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={filteredData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </Paper>
              )}
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Search;

import { Box, Typography, Container, Button, Alert, Card, CardContent, Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import SearchIcon from "@mui/icons-material/Search";
import MapIcon from "@mui/icons-material/Map";

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState(null);
  const [samples, setSamples] = useState([]);

  useEffect(() => {
    checkAPI();
  }, []);

  const checkAPI = async () => {
    try {
      const health = await api.healthCheck();
      const samplesData = await api.getSamples(1, 5);
      setApiStatus("connected");
      setSamples(samplesData.samples || []);
    } catch (error) {
      console.error("API connection failed:", error);
      setApiStatus("error");
    }
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            color: "#1976d2",
            mb: 2,
          }}
        >
          {t("title")}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: "#666",
            mb: 4,
          }}
        >
          Bioinformatics Analysis Platform
        </Typography>

        {/* API 狀態顯示 - HIDDEN */}
        {apiStatus === "connected" && (
          <Alert severity="success" sx={{ mb: 2, display: "none" }}>
            Backend API Connected • {samples.length} samples loaded
          </Alert>
        )}
        {apiStatus === "error" && (
          <Alert severity="error" sx={{ mb: 2, display: "none" }}>
            Backend API Connection Failed
          </Alert>
        )}

        {/* Test API Connection 按鈕 - HIDDEN */}
        <Button variant="outlined" onClick={checkAPI} sx={{ display: "none" }}>
          Test API Connection
        </Button>

        {/* 功能卡片 */}
        <Grid container spacing={3} sx={{ mt: 4, maxWidth: "800px" }}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
                },
              }}
              onClick={() => navigate("/search")}
            >
              <CardContent
                sx={{
                  textAlign: "center",
                  py: 4,
                }}
              >
                <SearchIcon
                  sx={{ fontSize: 48, color: "#1976d2", mb: 2 }}
                />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {t("nav.search")}
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Advanced Sample Search & Filter
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
                },
              }}
              onClick={() => navigate("/map")}
            >
              <CardContent
                sx={{
                  textAlign: "center",
                  py: 4,
                }}
              >
                <MapIcon
                  sx={{ fontSize: 48, color: "#1976d2", mb: 2 }}
                />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {t("nav.map")}
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Interactive Geographic Visualization
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;

import { Box, Typography, Container, Button, Alert } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { api } from "../services/api";

const Home = () => {
  const { t } = useTranslation();
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

        {/* API 狀態顯示 */}
        {apiStatus === "connected" && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Backend API Connected • {samples.length} samples loaded
          </Alert>
        )}
        {apiStatus === "error" && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Backend API Connection Failed
          </Alert>
        )}

        <Button variant="outlined" onClick={checkAPI}>
          Test API Connection
        </Button>
      </Box>
    </Container>
  );
};

export default Home;

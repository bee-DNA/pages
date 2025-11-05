import { Box, Typography, Container } from "@mui/material";
import { useTranslation } from "react-i18next";

const ComplexHeatmap = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, color: "#1976d2", mb: 3 }}
        >
          {t("nav.complexHeatmap")}
        </Typography>
        <Typography variant="body1" sx={{ color: "#666" }}>
          Complex Heatmap page content will be added here.
        </Typography>
      </Box>
    </Container>
  );
};

export default ComplexHeatmap;

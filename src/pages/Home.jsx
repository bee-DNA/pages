import { Box, Typography, Container } from "@mui/material";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();

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
      </Box>
    </Container>
  );
};

export default Home;

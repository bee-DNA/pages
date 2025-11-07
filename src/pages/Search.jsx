import { Box, Typography, Container } from "@mui/material";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/PageHeader";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";

const Search = () => {
  const { t } = useTranslation();

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
          <Typography variant="body1" sx={{ color: "#666" }}>
            Search page content will be added here.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Search;

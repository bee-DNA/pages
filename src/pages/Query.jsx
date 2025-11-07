import { Box, Container } from "@mui/material";
import { useState, useEffect } from "react";
import ResistanceTable from "../components/ResistanceTable";
import PageHeader from "../components/PageHeader";
import { api } from "../services/api";
import SearchIcon from "@mui/icons-material/Search";

const Query = () => {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSamples();
  }, []);

  const loadSamples = async () => {
    try {
      const data = await api.getSamples();
      setSamples(data.samples || []);
    } catch (error) {
      console.error("Failed to load samples:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ py: 4, px: 3 }}>
      <Box sx={{ width: "100%" }}>
        <PageHeader
          icon={<SearchIcon sx={{ fontSize: 28, color: "#1976d2" }} />}
          title="Query"
          subtitle="Antibiotic Resistance Data Analysis"
        />
        
        <Box
          sx={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <ResistanceTable samples={samples} loading={loading} />
        </Box>
      </Box>
    </Container>
  );
};

export default Query;

import { Box, Container } from "@mui/material";
import { useState, useEffect } from "react";
import ResistanceTable from "../components/ResistanceTable";
import { api } from "../services/api";

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
      console.error('Failed to load samples:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <ResistanceTable samples={samples} loading={loading} />
    </Container>
  );
};

export default Query;

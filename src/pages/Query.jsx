import { Box, Container } from "@mui/material";
import ResistanceTable from "../components/ResistanceTable";

const Query = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <ResistanceTable />
    </Container>
  );
};

export default Query;

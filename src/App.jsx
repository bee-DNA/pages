import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Query from "./pages/Query";
import Search from "./pages/Search";
import Heatmap from "./pages/Heatmap";
import ComplexHeatmap from "./pages/ComplexHeatmap";
import Map from "./pages/Map";
import CgMLST from "./pages/CgMLST";
import "./i18n/config";

// Material-UI 主題設定
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Microsoft YaHei"',
      '"微軟正黑體"',
    ].join(","),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
        >
          <Navbar />
          <Box
            component="main"
            sx={{ flexGrow: 1, backgroundColor: "#f5f5f5" }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/query" element={<Query />} />
              <Route path="/search" element={<Search />} />
              <Route path="/heatmap" element={<Heatmap />} />
              <Route path="/complex-heatmap" element={<ComplexHeatmap />} />
              <Route path="/map" element={<Map />} />
              <Route path="/cgmlst" element={<CgMLST />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageIcon from "../assets/language-exchange.svg";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  // 導航項目
  const navItems = [
    { key: "query", path: "/query" },
    { key: "search", path: "/search" },
    { key: "heatmap", path: "/heatmap" },
    { key: "complexHeatmap", path: "/complex-heatmap" },
    { key: "map", path: "/map" },
    { key: "cgMLST", path: "/cgmlst" },
  ];

  // 切換語言
  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "zh" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: 3 }}>
        {/* Logo 和標題 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              backgroundColor: "#1976d2",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            BM
          </Box>
          <Typography
            variant="h6"
            component="div"
            sx={{
              color: "#1976d2",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            onClick={() => navigate("/")}
          >
            Bee Metagenomics
          </Typography>
        </Box>

        {/* 導航按鈕 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            flexGrow: 1,
            justifyContent: "flex-end",
            mr: 1,
          }}
        >
          {navItems.map((item) => (
            <Button
              key={item.key}
              onClick={() => navigate(item.path)}
              sx={{
                color: location.pathname === item.path ? "#1976d2" : "#666",
                fontWeight: location.pathname === item.path ? 600 : 400,
                textTransform: "none",
                fontSize: "14px",
                minWidth: "115px", // 減小寬度但仍足夠容納中英文
                width: "115px",
                px: 1.5,
                borderBottom:
                  location.pathname === item.path
                    ? "2px solid #1976d2"
                    : "2px solid transparent",
                borderRadius: 0,
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                  color: "#1976d2",
                },
              }}
            >
              {t(`nav.${item.key}`)}
            </Button>
          ))}
        </Box>

        {/* 語言切換按鈕 */}
        <IconButton
          onClick={toggleLanguage}
          sx={{
            ml: 1,
            p: 1,
            width: 40,
            height: 40,
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.08)",
            },
          }}
          aria-label="toggle language"
        >
          <Box
            component="img"
            src={LanguageIcon}
            alt="Language Switch"
            sx={{
              width: 24,
              height: 24,
              opacity: 0.7,
              "&:hover": {
                opacity: 1,
              },
            }}
          />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

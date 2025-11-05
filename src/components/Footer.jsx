import { Box, Typography, Link } from "@mui/material";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { i18n } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#2c3e50",
        color: "white",
        py: 3,
        mt: "auto",
        borderTop: "3px solid #1976d2",
      }}
    >
      <Box
        sx={{
          maxWidth: "1200px",
          margin: "0 auto",
          px: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        {/* 主要信息 */}
        <Typography variant="body2" sx={{ fontSize: "14px", fontWeight: 500 }}>
          {i18n.language === "zh"
            ? "蜜蜂宏基因體分析平台"
            : "Bee Metagenomics Analysis Platform"}
        </Typography>

        {/* 開發者信息 */}
        <Typography variant="body2" sx={{ fontSize: "13px", color: "#bdc3c7" }}>
          {i18n.language === "zh" ? "開發者：" : "Developed by "}
          <Link
            href="https://github.com/evil9369"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: "#3498db",
              textDecoration: "none",
              fontWeight: 600,
              "&:hover": {
                textDecoration: "underline",
                color: "#5dade2",
              },
            }}
          >
            evil9369
          </Link>
        </Typography>

        {/* 版權信息 */}
        <Typography variant="body2" sx={{ fontSize: "12px", color: "#95a5a6" }}>
          © {currentYear} Bee Metagenomics. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;

import { Box, Typography } from "@mui/material";

const PageHeader = ({ icon, title, subtitle, children }) => {
  return (
    <Box
      sx={{
        mb: 3,
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "16px 20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      {/* Left: Title */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {icon && (
          <Box
            sx={{
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        )}
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#1976d2",
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{ color: "#999", fontSize: "11px" }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Right: Custom Controls */}
      {children && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {children}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;

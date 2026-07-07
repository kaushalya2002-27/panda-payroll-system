import { Box, Stack, Typography } from "@mui/material";
import useCurrentUser from "../../hooks/useCurrentUser";
import { useTheme } from "@mui/material/styles";
import insightImage from "../../assets/welcomeInsight.png";

function Insight() {
  const { user } = useCurrentUser();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Stack>
      <Typography
        variant="h3"
        align="center"
        sx={{ mt: 2, mb: 2, fontWeight: "bold", color: "var(--pallet-orange)" }}
      >
        {`Welcome ${user?.name}!`}
      </Typography>
      <Box
        component="img"
        src={insightImage}
        alt="Under Development"
        sx={{
          height: "auto",
          width: "60vw",
          maxHeight: "50vh",
          objectFit: "contain",
          justifySelf: "center",
          alignSelf: "center",
          filter: isDarkMode ? "brightness(0.9)" : "none",
        }}
      />
      <Typography
        variant="body1"
        align="center"
        sx={{
          mt: 2,
          color: isDarkMode ? theme.palette.text.secondary : "var(--pallet-main-blue)",
        }}
      >
        View real-time insights on payroll management, employee time cards, and overall workplace operations.
      </Typography>
    </Stack>
  );
}

export default Insight;
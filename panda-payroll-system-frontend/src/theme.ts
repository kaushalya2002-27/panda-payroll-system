import { createTheme } from "@mui/material/styles";

const getAppTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            // Light Mode
            primary: { main: "#024271" },
            background: { default: "#f8fafc", paper: "#ffffff" },
          }
        : {
            // Dark Mode
            primary: { main: "#90caf9" },
            background: { default: "#0b1329", paper: "#1c2541" },
          }),
    },
    typography: {
      fontFamily: "Poppins, sans-serif",
    },
    mixins: {
      toolbar: {
        minHeight: 64,
      },
    },
  });

export default getAppTheme;
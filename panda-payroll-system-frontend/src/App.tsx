import { BrowserRouter } from "react-router";
import AppRoutes from "./Routes.tsx";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./state/queryClient.ts";
import { createContext, useMemo, useState } from "react";
import getAppTheme from "./theme.ts";

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

function App() {
  const [mode, setMode] = useState<"light" | "dark">(() => {
  const savedMode = localStorage.getItem("themeMode");
  if (savedMode === "dark" || savedMode === "light") {
    return savedMode;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
});

  const colorMode = useMemo(
  () => ({
    toggleColorMode: () => {
      setMode((prevMode) => {
        const newMode = prevMode === "light" ? "dark" : "light";
        localStorage.setItem("themeMode", newMode);
        return newMode;
      });
    },
  }),
  []
);

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter basename={import.meta.env.VITE_BASE_PATH || '/'}>
              <SnackbarProvider maxSnack={3} autoHideDuration={2500}>
                <AppRoutes />
              </SnackbarProvider>
            </BrowserRouter>
          </ThemeProvider>
        </ColorModeContext.Provider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}

export default App;
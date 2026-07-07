import { Backdrop, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function PageLoader() {
  const theme = useTheme();
  return (
    <Backdrop
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        color: "#fff",
      }}
      open={true}
    >
      <CircularProgress color="info" size={"3rem"} />
    </Backdrop>
  );
}
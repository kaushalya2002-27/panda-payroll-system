import { Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import leftLandingLeave from "../../assets/b_leaf_l.svg";
import rightLandingLeave from "../../assets/b_leaf_r.svg";
import ImageCarousel from "../../components/ImageCarousel";
import RegistrationForm from "./RegistrationForm";
import useCurrentUser from "../../hooks/useCurrentUser";
import PageLoader from "../../components/PageLoader";
import { useNavigate } from "react-router";
import img1 from "../../assets/img1.png";
import img2 from "../../assets/img2.png";
import img3 from "../../assets/img3.png";

function RegistrationPage() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMdUp = useMediaQuery(theme.breakpoints.up(990));
  const navigate = useNavigate();

  const { user, status } = useCurrentUser();

  if (status === "loading" || status === "idle" || status === "pending") {
    return <PageLoader />;
  }

  if (user) {
    navigate("/home");
  }

  return (
    <Stack
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflowY: "hidden ",
      }}
    >
      <Stack
        direction={isMdUp ? "row" : "column"}
        sx={{ width: "100%", overflowY: "auto" }}
      >
        <Stack
          sx={{
            flex: isMdUp ? 3 : 1,
            backgroundColor: isDarkMode ? theme.palette.background.default : "#f2f2f2",
            height: isMdUp ? "100vh" : "auto",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ImageCarousel
            images={[
              { src: img1, alt: "Salaries & Slips" },
              { src: img2, alt: "Time & Attendance" },
              { src: img3, alt: "Employee Insights" },
            ]}
          />
          <Typography
            variant={isMdUp ? "h2" : "h3"}
            sx={{
              fontWeight: "700",
              color: isDarkMode ? "#fff" : "#525252",
              marginTop: "1rem",
              marginLeft: "1rem",
              marginRight: "1rem",
              textAlign: "center",
            }}
          >
            DIO
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "600",
              color: isDarkMode ? "#b0bec5" : "#525252",
              margin: "1rem",
              textAlign: "center",
            }}
          >
            copyright © 2026 DIO, All Rights Reserved
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "400",
              color: isDarkMode ? "#b0bec5" : "#525252",
              textAlign: "center",
              marginLeft: "3rem",
              marginRight: "3rem",
              marginBottom: "2rem",
            }}
          >
            Our system is designed to streamline processes, ensure accuracy, and
            support efficient management of employee-related operations, making
            everyday business tasks simpler, more reliable, and easier to manage.
          </Typography>
        </Stack>
        <Stack sx={{ flex: isMdUp ? 2 : 1, justifyContent: "center" }}>
          <RegistrationForm />
        </Stack>
      </Stack>
      <img
        src={leftLandingLeave}
        alt="Logo"
        width={150}
        height={150}
        style={{ position: "absolute", left: 0, bottom: -5, zIndex: 10 }}
      />
      <img
        src={rightLandingLeave}
        alt="Logo"
        width={150}
        height={150}
        style={{ position: "absolute", right: 0, bottom: -20, zIndex: 10 }}
      />
    </Stack>
  );
}

export default RegistrationPage;

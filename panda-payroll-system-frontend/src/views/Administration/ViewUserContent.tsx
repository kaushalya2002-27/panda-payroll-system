import { Avatar, Badge, Box, Button, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DrawerContentItem } from "../../components/ViewDataDrawer";
import useIsMobile from "../../customHooks/useIsMobile";
import { User } from "../../api/userApi";
import { useState } from "react";
import ProfileImage from "../../components/ProfileImageComponent";

function ViewUserContent({ selectedUser }: { selectedUser: User }) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const { isTablet } = useIsMobile();
  const [image, setImage] = useState(null);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const statusColor =
    selectedUser?.availability == true ? "#44b700" : "#f44336";
  const [imageFile, setImageFile] = useState<File | null>(null);

  return (
    <Stack
      sx={{
        display: "flex",
        marginY: 5,
        flexDirection: isTablet ? "column" : "row",
        p: "3rem",
      }}
      gap={4}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          p: "3rem",
          boxShadow: 3,
          backgroundColor: isDarkMode ? "#1c2541" : "background.paper",
        }}
        gap={2}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: "1.5rem",
            color: isDarkMode ? "#90caf9" : "var(--pallet-dark-blue)",
            marginTop: 2,
          }}
        >
          {selectedUser?.name}
        </Typography>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          variant="dot"
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: statusColor,
              color: statusColor,
              boxShadow: isDarkMode
                ? "0 0 0 2px #1c2541"
                : "0 0 0 2px white",
              height: "16px",
              width: "16px",
              borderRadius: "50%",
            },
          }}
        >
          <ProfileImage
            name={selectedUser?.name}
            files={imageFile ? [imageFile] : selectedUser?.profileImage}
            fontSize="5rem"
          />
        </Badge>
      </Box>
      {/* NOTE: removed the "& label, & p, & span" color overrides that were
          here before — they were conflicting with DrawerContentItem's own
          label/value colors and washing everything out to the same shade.
          DrawerContentItem now handles its own dark-mode colors directly. */}
      <Stack
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: isDarkMode ? "#1c2541" : "#fff",
          flex: 2,
          boxShadow: 3,
          p: "3rem",
        }}
      >
        <Stack
          sx={{
            display: "flex",
            flexDirection: "row",
            backgroundColor: isDarkMode ? "#1c2541" : "#fff",
            flex: 1,
          }}
        >
          <DrawerContentItem
            label="Employee Id"
            value={selectedUser?.id}
            sx={{ flex: 1 }}
          />
          <DrawerContentItem
            label="Email"
            value={selectedUser?.email}
            sx={{ flex: 1 }}
          />
        </Stack>

        <Stack
          sx={{
            display: "flex",
            flexDirection: "row",
            backgroundColor: isDarkMode ? "#1c2541" : "#fff",
            flex: 1,
          }}
        >
          <DrawerContentItem
            label="Full Name"
            value={selectedUser?.name}
            sx={{ flex: 1 }}
          />
          <DrawerContentItem
            label="Mobile Number"
            value={selectedUser?.mobile}
            sx={{ flex: 1 }}
          />
        </Stack>

        <Stack
          sx={{
            display: "flex",
            flexDirection: "row",
            backgroundColor: isDarkMode ? "#1c2541" : "#fff",
            flex: 1,
          }}
        >
          <DrawerContentItem
            label="Designation"
            value={selectedUser?.jobPosition}
            sx={{ flex: 1 }}
          />
          <DrawerContentItem
            label="Gender"
            value={selectedUser?.gender}
            sx={{ flex: 1 }}
          />
        </Stack>
        <Stack
          sx={{
            display: "flex",
            flexDirection: "row",
            backgroundColor: isDarkMode ? "#1c2541" : "#fff",
            flex: 1,
          }}
        >
          <DrawerContentItem
            label="User Level"
            value={selectedUser?.userLevel?.levelName}
            sx={{ flex: 1 }}
          />
          <DrawerContentItem
            label="User Type"
            value={selectedUser?.userType?.userType}
            sx={{ flex: 1 }}
          />
        </Stack>
        <Stack
          sx={{
            display: "flex",
            flexDirection: "row",
            backgroundColor: isDarkMode ? "#1c2541" : "#fff",
            flex: 1,
          }}
        >
          <DrawerContentItem
            label="Department"
            value={selectedUser?.department}
            sx={{ flex: 1 }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}

export default ViewUserContent;
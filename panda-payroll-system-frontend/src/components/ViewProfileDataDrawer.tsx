import {
  Alert,
  Box,
  Drawer,
  IconButton,
  SxProps,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import useIsMobile from "../customHooks/useIsMobile";
import CustomButton from "./CustomButton";
import PasswordResetDialog from "../views/Administration/OpenPasswordResetDiaolg";
import ResetEmailDialog from "../views/Administration/OpenEmailResetDialog";
import { useState } from "react";
import { User } from "../api/userApi";
import LockIcon from "@mui/icons-material/Lock";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { enqueueSnackbar } from "notistack";
import queryClient from "../state/queryClient";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { useNavigate } from "react-router";

function ViewProfileDataDrawer({
  open,
  handleClose,
  drawerContent,
  fullScreen,
}: {
  open: boolean;
  handleClose: () => void;
  drawerContent: React.ReactNode;
  fullScreen?: boolean;
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );
  return (
    <Drawer
      anchor={"right"}
      open={open}
      onClose={handleClose}
      sx={{ zIndex: 1300 }}
      PaperProps={{
        sx: {
          width: isMobile || fullScreen ? "100vw" : "30vw",
          padding: 2,
          backgroundColor: isDarkMode ? "#0b1329" : undefined,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

export function DrawerProfileHeader({
  title,
  handleClose,
  onEdit,
  onDelete,
  disableEdit,
  disableDelete,
}: {
  title: string;
  handleClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  disableEdit?: boolean;
  disableDelete?: boolean;
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        marginX: 2,
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end", my: 1 }}>
        <IconButton aria-label="delete" onClick={handleClose}>
          <CloseIcon sx={{ color: isDarkMode ? "#94a3b8" : "var(--pallet-light-grey)" }} />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ color: isDarkMode ? "#ffffff" : "inherit" }}>
          {title}
        </Typography>
      </Box>
    </Box>
  );
}

export function DrawerUpdateButtons({
  onResetEmail,
  onResetPassword,
  disableEdit,
}: {
  onResetEmail: () => void;
  onResetPassword: () => void;
  disableEdit?: boolean;
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const { isTablet } = useIsMobile();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: isTablet ? "space-between" : "flex-end",
          gap: 1,
          flexWrap: "wrap",
          marginTop: 2,
        }}
      >
        {onResetPassword &&
          (isTablet ? (
            <Box>
              <IconButton
                aria-label="edit"
                onClick={onResetPassword}
                disabled={disableEdit}
              >
                <VpnKeyOutlinedIcon sx={{ color: isDarkMode ? "#90caf9" : "var(--pallet-blue)" }} />
              </IconButton>
            </Box>
          ) : (
            <Box>
              <CustomButton
                variant="contained"
                sx={{
                  backgroundColor: isDarkMode ? "#90caf9" : "var(--pallet-blue)",
                  color: isDarkMode ? "#0b1329" : "#ffffff",
                }}
                size="medium"
                startIcon={<VpnKeyOutlinedIcon />}
                onClick={onResetPassword}
              >
                Reset Password
              </CustomButton>
            </Box>
          ))}

        {onResetEmail &&
          (isTablet ? (
            <Box>
              <IconButton
                aria-label="reset-email"
                onClick={onResetEmail}
                disabled={disableEdit}
              >
                <EmailOutlinedIcon sx={{ color: isDarkMode ? "#90caf9" : "var(--pallet-blue)" }} />
              </IconButton>
            </Box>
          ) : (
            <Box>
              <CustomButton
                variant="contained"
                sx={{
                  backgroundColor: isDarkMode ? "#90caf9" : "var(--pallet-blue)",
                  color: isDarkMode ? "#0b1329" : "#ffffff",
                }}
                size="medium"
                onClick={onResetEmail}
                startIcon={<EmailOutlinedIcon />}
              >
                Reset Email
              </CustomButton>
            </Box>
          ))}
        <CustomButton
          variant="contained"
          sx={{
            backgroundColor: "var(--pallet-orange)",
            width: "10rem",
          }}
          size="medium"
          startIcon={<LogoutIcon />}
          onClick={() => setLogoutDialogOpen(true)}
        >
          Log out
        </CustomButton>
      </Box>
      {logoutDialogOpen && (
        <DeleteConfirmationModal
          open={logoutDialogOpen}
          title="Log Out Confirmation"
          customDeleteButtonText="Log Out Now"
          customDeleteButtonIon={<LogoutIcon />}
          content={
            <>
              Are you sure you want to log out of the application?
              <Alert severity="warning" style={{ marginTop: "1rem" }}>
                You will be logged out of the application and will need to log
                in with credentials again to access your account.
              </Alert>
            </>
          }
          handleClose={() => setLogoutDialogOpen(false)}
          deleteFunc={async () => {
            localStorage.removeItem("token");
            queryClient.clear();
            window.location.href = import.meta.env.VITE_BASE_PATH || "/";
          }}
          onSuccess={() => {
            setLogoutDialogOpen(false);
            enqueueSnackbar("Logged Out Successfully!", {
              variant: "success",
            });
          }}
          handleReject={() => {
            setLogoutDialogOpen(false);
          }}
        />
      )}
    </>
  );
}

export function DrawerContentItem({
  label,
  value,
  isRichText,
  sx,
}: {
  label: string;
  value?: string | number;
  isRichText?: boolean;
  sx?: SxProps;
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        ...sx,
        paddingY: "0.3rem",
        paddingX: "0.5rem",
        minWidth: "8rem",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          paddingBottom: 0,
          color: isDarkMode ? "#90caf9 !important" : "var(--pallet-grey)",
        }}
      >
        {label}
      </Typography>
      {isRichText ? (
        <Typography
          variant="body2"
          sx={{
            color: isDarkMode ? "#ffffff !important" : "inherit",
            fontWeight: isDarkMode ? 600 : 400,
          }}
          dangerouslySetInnerHTML={{ __html: value ?? "--" }}
        />
      ) : (
        <Typography
          variant="body2"
          sx={{
            color: isDarkMode ? "#ffffff !important" : "inherit",
            fontWeight: isDarkMode ? 600 : 400,
          }}
        >
          {value ?? "--"}
        </Typography>
      )}
    </Box>
  );
}

export default ViewProfileDataDrawer;
import * as React from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import {
  Alert,
  Badge,
  Button,
  Collapse,
  Drawer as MobileDrawer,
  Stack,
  useMediaQuery,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router";
import { SidebarItem, sidebarItems } from "./SidebarItems";
import useIsMobile from "../../customHooks/useIsMobile";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import { useMemo, useState, useContext } from "react";
import { useSnackbar } from "notistack";
import queryClient from "../../state/queryClient";
import { PermissionKeysObject } from "../../views/Administration/SectionList";
import useCurrentUser from "../../hooks/useCurrentUser";
import "./MainLayout.css";
import ViewUserContent from "../../views/Administration/ViewUserProfileContent";
import ViewProfileDataDrawer, {
  DrawerProfileHeader,
} from "../ViewProfileDataDrawer";
import ProfileImage from "../ProfileImageComponent";
import logoUrl from "../../assets/dio-logo.png";
import { ColorModeContext } from "../../App";

const drawerWidth = 265;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: 0,
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
  [theme.breakpoints.down("md")]: {
    width: "100%",
    marginLeft: 0,
  },
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
}));

interface Props {
  children: JSX.Element | JSX.Element[];
}

export default function MainLayout({ children }: Props) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const colorMode = useContext(ColorModeContext);

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = React.useState(isMobile ? false : true);
  const { user } = useCurrentUser();
  const [openViewProfileDrawer, setOpenViewProfileDrawer] = useState(false);
  const [openEditUserRoleDialog, setOpenEditUserRoleDialog] = useState(false);
  const statusColor = user?.availability ? "#44b700" : "#f44336";

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const toggleDrawerOpen = () => {
    setOpen(!open);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        open={open}
        sx={{
          backgroundColor: isDarkMode ? theme.palette.background.paper : "#fff",
          color: isDarkMode ? "#fff" : "#000",
          boxShadow: isDarkMode
            ? "0px 2px 4px rgba(0,0,0,0.5)"
            : "0px 2px 4px rgba(0,0,0,0.1)",
          backgroundImage: "none",
        }}
      >
        <Toolbar>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                aria-label="open drawer"
                onClick={toggleDrawerOpen}
                edge="start"
                sx={[
                  {
                    color: isDarkMode ? "#90caf9" : "#024271",
                    marginRight: 3,
                  },
                  open && !isMobile && { display: "none" },
                ]}
              >
                <MenuIcon />
              </IconButton>
              {logoUrl && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={logoUrl}
                    alt="logo"
                    style={{
                      height: isMobile ? "40px" : "65px",
                      marginTop: "0px",
                      objectFit: "contain",
                      filter: isDarkMode ? "brightness(0) invert(1)" : "none",
                    }}
                  />
                </Box>
              )}
            </Box>
            {!isMobile && (
              <Box sx={{ display: "flex" }}>
                <Typography
                  variant="subtitle1"
                  noWrap
                  component="div"
                  sx={{
                    color: isDarkMode ? "#90caf9" : "var(--pallet-blue)",
                    display: "flex",
                    marginRight: "0.5rem",
                  }}
                >
                  Automate & Manage
                </Typography>
                <Typography
                  variant="subtitle1"
                  noWrap
                  component="div"
                  sx={{ color: isDarkMode ? "#fff" : "#000", display: "flex" }}
                >
                  <span className="slider-text" style={{ fontWeight: 600 }}>
                    Salaries & Slips
                  </span>
                  <span className="slider-text" style={{ fontWeight: 600 }}>
                    Time & Attendance
                  </span>
                  <span className="slider-text" style={{ fontWeight: 600 }}>
                    Employee Insights
                  </span>
                </Typography>
              </Box>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/*Dark Mode Toggle Button */}
              <IconButton
                onClick={colorMode.toggleColorMode}
                sx={{ color: isDarkMode ? "#ffca28" : "#024271" }}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>

              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: statusColor,
                    color: statusColor,
                    boxShadow: "0 0 0 2px white",
                    height: "8px",
                    width: "8px",
                    borderRadius: "50%",
                  },
                }}
              >
                <ProfileImage
                  name={user?.name}
                  files={user?.profileImage}
                  size="2rem"
                  onClick={() => setOpenViewProfileDrawer(true)}
                />
              </Badge>
              <ViewProfileDataDrawer
                open={openViewProfileDrawer}
                handleClose={() => setOpenViewProfileDrawer(false)}
                fullScreen={true}
                drawerContent={
                  <Stack spacing={1} sx={{ paddingX: theme.spacing(1) }}>
                    <DrawerProfileHeader
                      title="User Profile"
                      handleClose={() => setOpenViewProfileDrawer(false)}
                      onEdit={() => {
                        setOpenEditUserRoleDialog(true);
                      }}
                    />
                    <Stack>
                      <ViewUserContent selectedUser={user} />
                    </Stack>
                  </Stack>
                }
              />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <MobileDrawer
          variant="temporary"
          open={open}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: {
              backgroundColor: "#010f24",
              color: "#fff",
              elevation: 2,
            },
          }}
        >
          <DrawerContent handleDrawerClose={handleDrawerClose} />
        </MobileDrawer>
      ) : (
        <Drawer
          variant="permanent"
          open={open}
          PaperProps={{
            sx: {
              backgroundColor: "#010f24",
              color: "#fff",
              elevation: 2,
            },
          }}
        >
          <DrawerContent handleDrawerClose={handleDrawerClose} />
        </Drawer>
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          backgroundColor: theme.palette.background.default,
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}

const DrawerContent = ({
  handleDrawerClose,
}: {
  handleDrawerClose: () => void;
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { user } = useCurrentUser();

  const userPermissionObject = useMemo(() => {
    if (user && user?.permissionObject) {
      return user.permissionObject;
    }
  }, [user]);

  return (
    <>
      <DrawerHeader sx={{ justifyContent: "flex-start" }}>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === "rtl" ? (
            <ChevronRightIcon sx={{ color: "#fff" }} />
          ) : (
            <ChevronLeftIcon sx={{ color: "#fff" }} />
          )}
        </IconButton>
        <Typography
          variant="subtitle1"
          noWrap
          component="div"
          sx={{ color: "#7db0ff" }}
        >
          Hello, Welcome!
        </Typography>
      </DrawerHeader>
      <Divider sx={{ marginBottom: "1rem", backgroundColor: "#7db0ff" }} />
      <Box
        sx={{
          height: "calc(100vh - 75px)",
          overflowY: "auto",
          paddingLeft: 0,
          overflowX: "hidden",
        }}
      >
        {sidebarItems.map((item, i) => {
          if (item?.accessKey && !userPermissionObject[`${item?.accessKey}`])
            return null;

          if (item?.headline) {
            return (
              <Typography
                key={item.headline}
                variant="body2"
                sx={{
                  color: "#7db0ff",
                  padding: "0.5rem 1rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  marginTop: "0.5rem",
                }}
              >
                {item.headline}
              </Typography>
            );
          }

          if (item.nestedItems) {
            return (
              <Box
                sx={{ marginLeft: "1rem" }}
                key={`${item.href} +${item.title}`}
              >
                <NestedItem
                  item={item}
                  handleDrawerClose={handleDrawerClose}
                  userPermissionObject={userPermissionObject}
                />
              </Box>
            );
          }
          return (
            <ListItem
              key={item.href}
              disableGutters
              sx={{ paddingY: "3px", marginLeft: "1rem" }}
            >
              <LinkButton
                to={item.href}
                icon={item.icon}
                title={item.title}
                disabled={item.disabled}
                handleDrawerClose={handleDrawerClose}
              />
            </ListItem>
          );
        })}

        <Divider
          sx={{ backgroundColor: "var(--pallet-grey)", marginTop: "1rem" }}
        />
        <Button
          sx={{
            textTransform: "capitalize",
            marginLeft: "1rem",
            marginY: "1rem",
            color: "var(--pallet-orange)",
            width: "90%",
            justifyContent: "flex-start",
            paddingLeft: "1rem",
            borderRadius: "0.5rem",
          }}
          startIcon={<LogoutIcon />}
          onClick={() => setLogoutDialogOpen(true)}
        >
          Log Out
        </Button>
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
            window.location.href = "/";
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
};

const NestedItem = React.memo(
  ({
    item,
    handleDrawerClose,
    userPermissionObject,
  }: {
    item: SidebarItem;
    handleDrawerClose: () => void;
    userPermissionObject: PermissionKeysObject;
  }) => {
    const [open, setOpen] = React.useState(item.open);
    const isAllItemsHidden = useMemo(() => {
      const checkNestedItems = (nestedItems: SidebarItem[]) => {
        return nestedItems.every((nestedItem) => {
          if (nestedItem.nestedItems) {
            return checkNestedItems(nestedItem.nestedItems);
          }
          return (
            nestedItem?.accessKey && !userPermissionObject[nestedItem.accessKey]
          );
        });
      };

      return checkNestedItems(item.nestedItems);
    }, [item.nestedItems, userPermissionObject]);

    if (isAllItemsHidden) return null;

    return (
      <React.Fragment key={item.accessKey}>
        <Button
          onClick={() => setOpen((o) => !o)}
          endIcon={open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{
            fontSize: "0.8rem",
            paddingY: "0.2rem",
            alignItems: "center",
            marginY: "0.1rem",
          }}
          disabled={item.disabled}
        >
          <div
            style={{
              marginRight: "0.5rem",
              marginBottom: -4,
              color: item.disabled ? "grey" : "#fff",
            }}
          >
            {item.icon}
          </div>
          <Typography
            variant="body2"
            sx={{
              textTransform: "capitalize",
              color: item.disabled ? "grey" : "#fff",
            }}
          >
            {item.title}
          </Typography>
        </Button>
        <Collapse in={open} unmountOnExit>
          <List>
            {item.nestedItems.map((item) => {
              if (
                item?.accessKey &&
                !userPermissionObject[`${item?.accessKey}`]
              )
                return null;

              if (item.nestedItems) {
                return (
                  <Box key={item.href} sx={{ marginLeft: "0.5rem" }}>
                    <NestedItem
                      item={item}
                      handleDrawerClose={handleDrawerClose}
                      userPermissionObject={userPermissionObject}
                    />
                  </Box>
                );
              }

              return (
                <ListItem
                  disableGutters
                  key={item.href}
                  sx={{ paddingY: "3px", marginLeft: "0.5rem" }}
                >
                  <LinkButton
                    to={item.href}
                    icon={item.icon}
                    title={item.title}
                    disabled={item.disabled}
                    handleDrawerClose={handleDrawerClose}
                  />
                </ListItem>
              );
            })}
          </List>
        </Collapse>
      </React.Fragment>
    );
  }
);

interface LinkButtonProps {
  to: string;
  icon: any;
  title: string;
  disabled?: boolean;
  handleDrawerClose: () => void;
}

export const LinkButton = React.memo(
  ({ to, icon, title, disabled, handleDrawerClose }: LinkButtonProps) => {
    const { pathname } = useLocation();
    const { isTablet } = useIsMobile();

    const isMatch = to === "/" ? pathname === to : pathname.startsWith(to);

    return (
      <Link
        to={to}
        style={{ width: 220 }}
        onClick={() => {
          if (isTablet) handleDrawerClose();
        }}
      >
        <Button
          sx={{
            fontSize: "0.8rem",
            paddingY: "0.2rem",
            alignItems: "center",
            borderLeft: isMatch ? "4px solid var(--pallet-orange)" : "none",
          }}
          disabled={disabled}
        >
          <div
            style={{
              marginRight: "0.4rem",
              marginBottom: -5,
              color: disabled
                ? "grey"
                : isMatch
                ? "var(--pallet-orange)"
                : "#fff",
            }}
          >
            {icon}
          </div>
          <Typography
            variant="body2"
            sx={{
              textTransform: "capitalize",
              color: disabled
                ? "grey"
                : isMatch
                ? "var(--pallet-orange)"
                : "#fff",
            }}
          >
            {title}
          </Typography>
        </Button>
      </Link>
    );
  }
);
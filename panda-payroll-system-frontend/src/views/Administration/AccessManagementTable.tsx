import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Alert,
  Box,
  LinearProgress,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import Breadcrumb from "../../components/BreadCrumb";
import PageTitle from "../../components/PageTitle";
import { UserRole } from "../../api/userApi";
import CustomButton from "../../components/CustomButton";
import ViewDataDrawer, { DrawerHeader } from "../../components/ViewDataDrawer";
import AccessManagementDrawerContent from "./AccessManagementDrawerContent";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { useSnackbar } from "notistack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddOrEditAccessRoleDialog from "./AddOrEditAccessRoleDialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteAccessRole,
  getAccessRolesList,
  updateAccessRole,
} from "../../api/accessManagementApi";
import queryClient from "../../state/queryClient";
import useCurrentUserHaveAccess from "../../hooks/useCurrentUserHaveAccess";
import { PermissionKeys } from "./SectionList";

function AccessManagementTable() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark"; 
  const { enqueueSnackbar } = useSnackbar();
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [openAccessManagementViewDrawer, setOpenAccessManagementViewDrawer] =
    useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addOrEditAccessRoleDialogOpen, setAddOrEditAccessRoleDialogOpen] =
    useState(false);

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "User Management" },
  ];

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  const { data: roles, isFetching: isFetchingRoles } = useQuery({
    queryKey: ["access-roles"],
    queryFn: getAccessRolesList,
  });

  const { mutate: updateAccessRoleMutation } = useMutation({
    mutationFn: updateAccessRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-roles"] });
      enqueueSnackbar("Access Role Updated Successfully!", {
        variant: "success",
      });
      setSelectedRole(null);
      setOpenAccessManagementViewDrawer(false);
      setAddOrEditAccessRoleDialogOpen(false);
    },
    onError: () => {
      enqueueSnackbar(`Access Role Update Failed`, {
        variant: "error",
      });
    },
  });

  const { mutate: deleteAccessMutation } = useMutation({
    mutationFn: deleteAccessRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-roles"] });
      enqueueSnackbar("Access Role Deleted Successfully!", {
        variant: "success",
      });
      setSelectedRole(null);
      setOpenAccessManagementViewDrawer(false);
      setDeleteDialogOpen(false);
    },
    onError: () => {
      enqueueSnackbar(`Access Role Delete Failed`, {
        variant: "error",
      });
    },
  });

  return (
    <Stack>
      {/* Title & Breadcrumb Container */}
      <Box
        sx={{
          padding: theme.spacing(2),
          boxShadow: 2,
          marginY: 2,
          borderRadius: 1,
          overflowX: "hidden",
          backgroundColor: isDarkMode ? "#1c2541" : "background.paper",
        }}
      >
        <Box sx={{ "& h4, & h5, & h6": { color: isDarkMode ? "#90caf9" : "inherit" }, "& p, & span, & a": { color: isDarkMode ? "#ffffff" : "inherit" } }}>
          <PageTitle title="User Management" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>
      </Box>

      {/* Main Table Container */}
      <Stack sx={{ alignItems: "center" }}>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{
            overflowX: "auto",
            maxWidth: isMobile ? "88vw" : "100%",
            backgroundColor: isDarkMode ? "#1c2541" : "background.paper", 
          }}
        >
          {/* "Create New Role" button removed — the per-user "Give Access"
              flow on the Users page already creates an individual role for
              each user automatically, so a generic "create a role from
              scratch" button isn't needed here. Existing roles can still
              be viewed and edited below. */}
          {isFetchingRoles && <LinearProgress sx={{ width: "100%" }} />}
          <Table aria-label="simple table">
            <TableHead 
              sx={{ 
                backgroundColor: isDarkMode ? "#2e3b63" : "var(--pallet-lighter-blue)" 
              }}
            >
              <TableRow>
                <TableCell sx={{ color: isDarkMode ? "#ffffff" : "inherit" }}>Name</TableCell>
                <TableCell align="left" sx={{ color: isDarkMode ? "#ffffff" : "inherit" }}>Description</TableCell>
                <TableCell align="center"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles?.length > 0 ? (
                roles.map((row) => (
                  <TableRow
                    key={`${row.id}`}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      cursor: "pointer",
                      borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit",
                      "&:hover": {
                        backgroundColor: isDarkMode ? "#243056" : "#f1f5f9", 
                      }
                    }}
                  >
                    <TableCell component="th" scope="row" sx={{ color: isDarkMode ? "#cbd5e1" : "inherit" }}>
                      {row.userType}
                    </TableCell>
                    <TableCell align="left" sx={{ color: isDarkMode ? "#cbd5e1" : "inherit" }}>{row.description}</TableCell>
                    <TableCell align="center">
                      <CustomButton
                        variant="contained"
                        sx={{
                          backgroundColor: isDarkMode ? "rgba(144, 202, 249, 0.15)" : "var(--pallet-blue)", 
                          color: isDarkMode ? "#90caf9" : "#ffffff",
                          border: isDarkMode ? "1px solid #90caf9" : "none",
                          "&:hover": {
                            backgroundColor: isDarkMode ? "rgba(144, 202, 249, 0.3)" : "var(--pallet-blue)",
                          }
                        }}
                        size="medium"
                        onClick={() => {
                          setSelectedRole(row);
                          setOpenAccessManagementViewDrawer(true);
                        }}
                        startIcon={<VisibilityIcon />}
                      >
                        View Role Access
                      </CustomButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Typography variant="body2" sx={{ color: isDarkMode ? "#94a3b8" : "inherit" }}>No roles found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      {/* View Drawer */}
      <ViewDataDrawer
        open={openAccessManagementViewDrawer}
        handleClose={() => setOpenAccessManagementViewDrawer(false)}
        fullScreen={true}
        drawerContent={
          <Stack spacing={1} sx={{ paddingX: theme.spacing(1) }}>
            <DrawerHeader
              title="Role Access Management"
              handleClose={() => setOpenAccessManagementViewDrawer(false)}
              onEdit={() => {
                setSelectedRole(selectedRole);
                setAddOrEditAccessRoleDialogOpen(true);
              }}
              disableEdit={
                !useCurrentUserHaveAccess(PermissionKeys.ADMIN_ACCESS_MNG_EDIT)
              }
              onDelete={() => setDeleteDialogOpen(true)}
              disableDelete={
                !useCurrentUserHaveAccess(
                  PermissionKeys.ADMIN_ACCESS_MNG_DELETE
                )
              }
            />
            {selectedRole && (
              <AccessManagementDrawerContent selectedRole={selectedRole} />
            )}
          </Stack>
        }
      />

      {/* Edit Dialog (only reachable via "Edit" on an existing role now,
          since the standalone "Create New Role" entry point was removed) */}
      {addOrEditAccessRoleDialogOpen && selectedRole && (
        <AddOrEditAccessRoleDialog
          open={addOrEditAccessRoleDialogOpen}
          handleClose={() => setAddOrEditAccessRoleDialogOpen(false)}
          onSubmit={(data) => {
            updateAccessRoleMutation(data);
          }}
          defaultValues={selectedRole}
        />
      )}

      {/* Delete Confirmation */}
      {deleteDialogOpen && (
        <DeleteConfirmationModal
          open={deleteDialogOpen}
          title="Remove Role Confirmation"
          content={
            <>
              Are you sure you want to remove this role?
              <Alert severity="warning" style={{ marginTop: "1rem" }}>
                This action is not reversible.
              </Alert>
            </>
          }
          handleClose={() => setDeleteDialogOpen(false)}
          deleteFunc={async () => {
            deleteAccessMutation(selectedRole.id);
          }}
          onSuccess={() => {
            setOpenAccessManagementViewDrawer(false);
            setSelectedRole(null);
            setDeleteDialogOpen(false);
            enqueueSnackbar("Role Deleted Successfully!", {
              variant: "success",
            });
          }}
          handleReject={() => {
            setOpenAccessManagementViewDrawer(false);
            setSelectedRole(null);
            setDeleteDialogOpen(false);
          }}
        />
      )}
    </Stack>
  );
}

export default AccessManagementTable;
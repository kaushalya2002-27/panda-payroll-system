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
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  TableFooter,
  TablePagination,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PageTitle from "../../components/PageTitle";
import Breadcrumb from "../../components/BreadCrumb";
import { useEffect, useMemo, useState } from "react";
import ViewDataDrawer, { DrawerHeader } from "../../components/ViewDataDrawer";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { useSnackbar } from "notistack";
import { fetchAllUsers, giveUserAccess, updateUserType, User } from "../../api/userApi";
import ViewUserContent from "./ViewUserContent";
import EditUserRoleDialog from "./EditUserRoleDialog";
import { PermissionKeys } from "./SectionList";
import useCurrentUserHaveAccess from "../../hooks/useCurrentUserHaveAccess";
import { useMutation, useQuery } from "@tanstack/react-query";
import { green, grey, red } from "@mui/material/colors";
import queryClient from "../../state/queryClient";
import DeleteIcon from "@mui/icons-material/Delete";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import CustomButton from "../../components/CustomButton";

function UserTable() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const { enqueueSnackbar } = useSnackbar();

  // State for the "View User Details" drawer
  const [openViewDrawer, setOpenViewDrawer] = useState(false);
  const [selectedRow, setSelectedRow] = useState<User>(null);

  // State for the "Edit User Role" dialog
  const [openEditUserRoleDialog, setOpenEditUserRoleDialog] = useState(false);

  // State for the "Delete User" confirmation modal
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<User>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  // IMPORTANT: Hooks must always be called at the top level of the component,
  // never inside a .map() loop or a condition. We call them once here and
  // reuse the resulting boolean values below.
  const canDeleteUsers = useCurrentUserHaveAccess(PermissionKeys.ADMIN_USERS_DELETE);
  const canEditUsers = useCurrentUserHaveAccess(PermissionKeys.ADMIN_USERS_EDIT);

  // Pagination handlers
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Users" },
  ];

  // Fetch all users from the backend
  const { data: usersData, isFetching: isUserDataFetching } = useQuery({
    queryKey: ["users"],
    queryFn: fetchAllUsers,
  });

  // Slice the data client-side for pagination
  const paginatedUsersData = useMemo(() => {
    if (!usersData) return [];
    if (rowsPerPage === -1) {
      return usersData;
    }
    return usersData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [usersData, page, rowsPerPage]);

  // Whenever the users list refetches (e.g. after an update), keep the
  // currently open "View Details" drawer in sync with the latest data
  // for that same user, instead of showing a stale snapshot.
  useEffect(() => {
    if (selectedRow && usersData) {
      const freshRow = usersData.find((u: User) => u.id === selectedRow.id);
      if (freshRow) {
        setSelectedRow(freshRow);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersData]);

  // Mutation: update a user's role/department/job position etc.
  const { mutate: updateUserRoleMutation } = useMutation({
    mutationFn: updateUserType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpenEditUserRoleDialog(false);
      enqueueSnackbar("User Role Updated Successfully!", {
        variant: "success",
      });
      // Note: the View Details drawer is intentionally left open here.
      // The useEffect above will refresh `selectedRow` with the latest
      // data once the "users" query refetches, so the user lands back
      // on the details page with the updated values.
    },
    onError: () => {
      enqueueSnackbar(`User Role Update Failed`, {
        variant: "error",
      });
    },
  });

  // Mutation: give a newly registered (guest) user basic access
  // This creates a default permission record for the user (Insight page only)
  const { mutate: giveAccessMutation, isPending: isGivingAccess } = useMutation({
    mutationFn: giveUserAccess,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["access-roles"] });
      enqueueSnackbar("Access Given Successfully! User can now log in.", {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(`Failed to give access`, {
        variant: "error",
      });
    },
  });

  return (
    <Stack>
      {/* Page title and breadcrumb */}
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
        <Box
          sx={{
            "& h4, & h5, & h6": { color: isDarkMode ? "#90caf9" : "inherit" },
            "& p, & span, & a": { color: isDarkMode ? "#ffffff" : "inherit" },
          }}
        >
          <PageTitle title="Users" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>
      </Box>

      {/* Users table */}
      <Stack sx={{ alignItems: "center" }}>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{
            // On mobile, allow horizontal scroll instead of squeezing columns
            overflowX: "auto",
            maxWidth: isMobile ? "88vw" : "100%",
            backgroundColor: isDarkMode ? "#1c2541" : "background.paper",
          }}
        >
          {isUserDataFetching && <LinearProgress sx={{ width: "100%" }} />}

          <Table aria-label="users table" size={isMobile ? "small" : "medium"}>
            <TableHead
              sx={{
                backgroundColor: isDarkMode ? "#2e3b63" : "var(--pallet-lighter-blue)",
              }}
            >
              <TableRow>
                <TableCell sx={{ color: isDarkMode ? "#ffffff" : "inherit", whiteSpace: "nowrap" }}>
                  Id
                </TableCell>
                <TableCell align="left" sx={{ color: isDarkMode ? "#ffffff" : "inherit", whiteSpace: "nowrap" }}>
                  Name
                </TableCell>
                <TableCell align="left" sx={{ color: isDarkMode ? "#ffffff" : "inherit", whiteSpace: "nowrap" }}>
                  Email
                </TableCell>
                <TableCell align="left" sx={{ color: isDarkMode ? "#ffffff" : "inherit", whiteSpace: "nowrap" }}>
                  Role
                </TableCell>
                <TableCell align="left" sx={{ color: isDarkMode ? "#ffffff" : "inherit", whiteSpace: "nowrap" }}>
                  Job Position
                </TableCell>
                <TableCell align="center" sx={{ color: isDarkMode ? "#ffffff" : "inherit", whiteSpace: "nowrap" }}>
                  Access
                </TableCell>
                <TableCell align="center" sx={{ color: isDarkMode ? "#ffffff" : "inherit", whiteSpace: "nowrap" }}>
                  Status
                </TableCell>
                <TableCell align="center" sx={{ color: isDarkMode ? "#ffffff" : "inherit", whiteSpace: "nowrap" }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedUsersData?.length > 0 ? (
                paginatedUsersData?.map((row) => {
                  // A "guest" role means the admin hasn't granted this user
                  // any specific access yet — so we show the "Give Access" button.
                  // Any other role means access has already been assigned.
                  const hasAccess =
                    row.userType?.userType && row.userType?.userType !== "guest";

                  return (
                    <TableRow
                      key={`${row.id}`}
                      onClick={() => {
                        setSelectedRow(row);
                        setOpenViewDrawer(true);
                      }}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: isDarkMode ? "#243056" : "#f1f5f9",
                        },
                      }}
                    >
                      <TableCell
                        align="left"
                        sx={{
                          color: isDarkMode ? "#cbd5e1" : "inherit",
                          fontSize: isMobile ? "0.8rem" : "inherit",
                        }}
                      >
                        {row.id}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          color: isDarkMode ? "#cbd5e1" : "inherit",
                          fontSize: isMobile ? "0.8rem" : "inherit",
                        }}
                      >
                        {row.name}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          color: isDarkMode ? "#cbd5e1" : "inherit",
                          fontSize: isMobile ? "0.8rem" : "inherit",
                        }}
                      >
                        {row.email}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          color: isDarkMode ? "#cbd5e1" : "inherit",
                          fontSize: isMobile ? "0.8rem" : "inherit",
                        }}
                      >
                        {row.userType?.userType}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          color: isDarkMode ? "#cbd5e1" : "inherit",
                          fontSize: isMobile ? "0.8rem" : "inherit",
                        }}
                      >
                        {row.jobPosition ?? "--"}
                      </TableCell>

                      {/* Access column: shows either a green "Access Assigned" badge
                          or a red "Give Access" button for guests.
                          stopPropagation prevents the row's onClick (view drawer) from firing. */}
                      <TableCell
                        align="center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {hasAccess ? (
                          <Chip
                            label="Access Assigned"
                            size="small"
                            sx={{
                              backgroundColor: isDarkMode
                                ? "rgba(76, 175, 80, 0.2)"
                                : green[100],
                              color: isDarkMode ? "#81c784" : green[800],
                              fontWeight: isDarkMode ? "bold" : "normal",
                            }}
                          />
                        ) : (
                          <CustomButton
                            variant="contained"
                            size="small"
                            startIcon={<LockOpenIcon fontSize="small" />}
                            disabled={isGivingAccess}
                            sx={{
                              backgroundColor: red[600],
                              color: "#fff",
                              whiteSpace: "nowrap",
                              "&:hover": { backgroundColor: red[700] },
                            }}
                            onClick={() => giveAccessMutation(row.id)}
                          >
                            Give Access
                          </CustomButton>
                        )}
                      </TableCell>

                      {/* Status column: Active / Inactive based on availability */}
                      <TableCell align="center">
                        {row.availability ? (
                          <Chip
                            label="Active"
                            size="small"
                            sx={{
                              backgroundColor: isDarkMode
                                ? "rgba(76, 175, 80, 0.2)"
                                : green[100],
                              color: isDarkMode ? "#81c784" : green[800],
                              fontWeight: isDarkMode ? "bold" : "normal",
                            }}
                          />
                        ) : (
                          <Chip
                            label="Inactive"
                            size="small"
                            sx={{
                              backgroundColor: isDarkMode
                                ? "rgba(158, 158, 158, 0.2)"
                                : grey[100],
                              color: isDarkMode ? "#e0e0e0" : grey[800],
                            }}
                          />
                        )}
                      </TableCell>

                      {/* Action column: delete user.
                          stopPropagation prevents the row's onClick (view drawer) from firing. */}
                      <TableCell
                        align="center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconButton
                          size="small"
                          disabled={!canDeleteUsers}
                          onClick={() => {
                            setRowToDelete(row);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon fontSize="small" sx={{ color: red[500] }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  {/* colSpan matches the actual number of columns (8) */}
                  <TableCell colSpan={8} align="center">
                    <Typography
                      variant="body2"
                      sx={{ color: isDarkMode ? "#94a3b8" : "inherit" }}
                    >
                      No Users found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={100}
                  count={usersData?.length ?? 0}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  showFirstButton={true}
                  showLastButton={true}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{
                    color: isDarkMode ? "#cbd5e1" : "inherit",
                    "& .MuiIconButton-root": {
                      color: isDarkMode ? "#cbd5e1" : "inherit",
                    },
                  }}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Stack>

      {/* Drawer showing full details of the selected user */}
      <ViewDataDrawer
        open={openViewDrawer}
        handleClose={() => setOpenViewDrawer(false)}
        fullScreen={true}
        drawerContent={
          <Stack spacing={1} sx={{ paddingX: theme.spacing(1) }}>
            <DrawerHeader
              title="User Details"
              handleClose={() => setOpenViewDrawer(false)}
              onEdit={() => {
                setSelectedRow(selectedRow);
                setOpenEditUserRoleDialog(true);
              }}
              disableEdit={!canEditUsers}
            />

            {selectedRow && (
              <Stack>
                <ViewUserContent selectedUser={selectedRow} />
              </Stack>
            )}
          </Stack>
        }
      />

      {/* Dialog for editing a user's role, department, job position etc. */}
      {openEditUserRoleDialog && (
        <EditUserRoleDialog
          open={openEditUserRoleDialog}
          handleClose={() => {
            setOpenEditUserRoleDialog(false);
          }}
          onSubmit={(data) => {
            updateUserRoleMutation(data);
          }}
          defaultValues={selectedRow}
        />
      )}

      {/* Confirmation modal before deleting a user */}
      {deleteDialogOpen && (
        <DeleteConfirmationModal
          open={deleteDialogOpen}
          title="Remove User Confirmation"
          content={
            <>
              Are you sure you want to remove this user?
              <Alert severity="warning" style={{ marginTop: "1rem" }}>
                This action is not reversible.
              </Alert>
            </>
          }
          handleClose={() => setDeleteDialogOpen(false)}
          // TODO: Backend delete endpoint is not implemented yet.
          // Once available, call it here using rowToDelete.id
          deleteFunc={async () => {}}
          onSuccess={() => {
            setRowToDelete(null);
            setDeleteDialogOpen(false);
            enqueueSnackbar("User Deleted Successfully!", {
              variant: "success",
            });
          }}
          handleReject={() => {
            setRowToDelete(null);
            setDeleteDialogOpen(false);
          }}
        />
      )}
    </Stack>
  );
}

export default UserTable;
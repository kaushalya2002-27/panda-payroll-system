import { UserRole } from "../../api/userApi";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DrawerContentItem } from "../../components/ViewDataDrawer";
import {
  PermissionKeysObject,
  PermissionSection,
  PermissionSectionsMap,
} from "./SectionList";
import useIsMobile from "../../customHooks/useIsMobile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

function AccessManagementDrawerContent({
  selectedRole,
}: {
  selectedRole: UserRole;
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Stack spacing={1} sx={{ padding: theme.spacing(1) }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          "& label, & span, & p": { color: isDarkMode ? "#ffffff" : "inherit" } 
        }}
      >
        <DrawerContentItem
          label="Name"
          value={selectedRole.userType}
          sx={{ flex: 1 }}
        />
        <DrawerContentItem
          label="Description"
          value={selectedRole?.description}
          sx={{ flex: 1 }}
        />
      </Box>
      <Box sx={{ paddingY: "1rem" }}>
        <Typography variant="subtitle2" sx={{ marginBottom: "1rem", color: isDarkMode ? "#90caf9" : "inherit" }}>
          User Roles Permission
        </Typography>
        <Alert severity="info">
          Below are the permissions assigned to the selected role.
        </Alert>
      </Box>
      <Stack>
        {PermissionSectionsMap.map((permissionSection) => (
          <SectionAccordion
            key={permissionSection.mainSection}
            permissionSection={permissionSection}
            selectedRolePermissions={selectedRole.permissionObject}
          />
        ))}
      </Stack>
    </Stack>
  );
}

const SectionAccordion = ({
  permissionSection,
  selectedRolePermissions,
}: {
  permissionSection: PermissionSection;
  selectedRolePermissions: PermissionKeysObject;
}) => {
  const { isMobile } = useIsMobile();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Accordion 
      sx={{ 
        backgroundColor: isDarkMode ? "#1e293b" : "background.paper", 
        color: isDarkMode ? "#ffffff" : "inherit"
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: isDarkMode ? "#ffffff" : "inherit" }} />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography component="span" sx={{ fontWeight: "bold" }}>
          {permissionSection.mainSection}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer
          sx={{
            overflowX: "auto",
            maxWidth: isMobile ? "88vw" : "100%",
          }}
        >
          <Table aria-label="simple table">
            <TableHead sx={{ backgroundColor: isDarkMode ? "#334155" : "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell></TableCell>
                <TableCell align="center" sx={{ color: isDarkMode ? "#ffffff" : "inherit" }}>View</TableCell>
                <TableCell align="center" sx={{ color: isDarkMode ? "#ffffff" : "inherit" }}>Create</TableCell>
                <TableCell align="center" sx={{ color: isDarkMode ? "#ffffff" : "inherit" }}>Update</TableCell>
                <TableCell align="center" sx={{ color: isDarkMode ? "#ffffff" : "inherit" }}>Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {permissionSection.subSections.map((row, index) => {
                if ("break" in row) {
                  return (
                    <TableRow key={`break-${index}`}>
                      <TableCell
                        colSpan={5}
                        align="left"
                        sx={{
                          backgroundColor: isDarkMode ? "#1e293b" : "var(--pallet-lighter-grey)",
                          marginTop: "0.5rem",
                          borderTop: isDarkMode ? "2px solid #475569" : "2px solid var(--pallet-grey)",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: "bold", color: isDarkMode ? "#90caf9" : "inherit" }}>
                          {row.name}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                } else {
                  return (
                    <TableRow key={`${row.key}`} sx={{ borderBottom: isDarkMode ? "1px solid #334155" : "inherit" }}>
                      <TableCell component="th" scope="row" sx={{ color: isDarkMode ? "#cbd5e1" : "inherit" }}>
                        {row.name}
                      </TableCell>
                      {row.permissionsExists.VIEW ? (
                        <TableCell align="center">
                          {selectedRolePermissions[`${row.key}_VIEW`] ? (
                            <CheckCircleIcon fontSize="small" sx={{ color: "#4caf50" }} /> 
                          ) : (
                            <CancelIcon fontSize="small" sx={{ color: isDarkMode ? "#64748b" : "var(--pallet-grey)" }} />
                          )}
                        </TableCell>
                      ) : (
                        <TableCell align="center"></TableCell>
                      )}
                      {row.permissionsExists.CREATE ? (
                        <TableCell align="center" sx={{ color: isDarkMode ? "#94a3b8" : "inherit" }}>
                          {selectedRolePermissions[`${row.key}_CREATE`] ? (
                            <CheckCircleIcon fontSize="small" sx={{ color: "#4caf50" }} />
                          ) : (
                            <CancelIcon fontSize="small" sx={{ color: isDarkMode ? "#64748b" : "var(--pallet-grey)" }} />
                          )}
                        </TableCell>
                      ) : (
                        <TableCell align="center" sx={{ color: isDarkMode ? "#64748b" : "inherit" }}>-</TableCell>
                      )}
                      {row.permissionsExists.EDIT ? (
                        <TableCell align="center" sx={{ color: isDarkMode ? "#94a3b8" : "inherit" }}>
                          {selectedRolePermissions[`${row.key}_EDIT`] ? (
                            <CheckCircleIcon fontSize="small" sx={{ color: "#4caf50" }} />
                          ) : (
                            <CancelIcon fontSize="small" sx={{ color: isDarkMode ? "#64748b" : "var(--pallet-grey)" }} />
                          )}
                        </TableCell>
                      ) : (
                        <TableCell align="center" sx={{ color: isDarkMode ? "#64748b" : "inherit" }}>-</TableCell>
                      )}
                      {row.permissionsExists.DELETE ? (
                        <TableCell align="center" sx={{ color: isDarkMode ? "#94a3b8" : "inherit" }}>
                          {selectedRolePermissions[`${row.key}_DELETE`] ? (
                            <CheckCircleIcon fontSize="small" sx={{ color: "#4caf50" }} />
                          ) : (
                            <CancelIcon fontSize="small" sx={{ color: isDarkMode ? "#64748b" : "var(--pallet-grey)" }} />
                          )}
                        </TableCell>
                      ) : (
                        <TableCell align="center" sx={{ color: isDarkMode ? "#64748b" : "inherit" }}>-</TableCell>
                      )}
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
};

export default AccessManagementDrawerContent;
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  IconButton
} from "@mui/material";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import { useTheme } from "@mui/material/styles"; 

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import useCurrentUser from "../../hooks/useCurrentUser";
import { PermissionKeys } from "../Administration/SectionList";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/payroll`;

interface EmployeeDetails {
  id: number;
  emp_code: string;
  full_name: string;
  nic: string;
  gender: string;
  date_of_birth: string;
  join_date: string;
  dept_name: string;
  designation: string;
  phone: string;
  email: string;
  address: string;
  bank_name: string;
  bank_branch: string;
  account_number: string;
  emergency_name: string;
  emergency_phone: string;
  emergency_relation: string;
  photo?: string;
  is_active: number;
}

export default function ViewEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const { user } = useCurrentUser();
  const userPermissionObject = user?.permissionObject;

  const [emp, setEmp] = useState<EmployeeDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/employees/${id}`)
      .then((res) => {
        setEmp(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching employee info:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!emp) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error" variant="h6">Employee not found.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/payroll/employees")} sx={{ mt: 2 }}>
          Back to Employees
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      
      {/* Top Action Header Row */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/payroll/employees")}
          sx={{ 
            textTransform: "none", 
            fontWeight: 600, 
            color: isDarkMode ? "#90caf9" : "#1a73e8" 
          }}
        >
          Back to List
        </Button>

        <Box sx={{ display: "flex", gap: 1.5 }}>
      {userPermissionObject?.[PermissionKeys.PAYROLL_TIME_CARDS_VIEW] && (
        <Button
          variant="outlined"
          startIcon={<AccessTimeIcon />}
          onClick={() => {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().toLocaleDateString("en-US", { month: "long" });
            navigate(`/payroll/time-cards?emp=${emp.id}&year=${currentYear}&month=${currentMonth}`);
          }}
          sx={{
            textTransform: "none",
            borderRadius: 1.5,
            color: isDarkMode ? "#90caf9" : "#1a73e8",
            borderColor: isDarkMode ? "#90caf9" : "#1a73e8",
            "&:hover": { borderColor: isDarkMode ? "#64b5f6" : "#1557b0", bgcolor: isDarkMode ? "rgba(144, 202, 249, 0.08)" : "#f1f7fe" }
          }}
        >
          Time Card
        </Button>
      )}
      {userPermissionObject?.[PermissionKeys.PAYROLL_ALL_EMPLOYEES_EDIT] && (
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/payroll/employees/${emp.id}/edit`)}
          sx={{ 
            textTransform: "none", 
            borderRadius: 1.5, 
            bgcolor: isDarkMode ? "#004494" : "#0056b3", 
            "&:hover": { bgcolor: "#003566" } 
          }}
        >
          Edit Profile
        </Button>
      )}
    </Box>
      </Box>

      {/* Main Profile Grid Container */}
      <Grid container spacing={3}>
        
        {/* LEFT COLUMN: Profile Header/Avatar Info Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 4, 
            textAlign: "center", 
            borderRadius: 3, 
            boxShadow: "0px 2px 12px rgba(0,0,0,0.04)",
            backgroundColor: isDarkMode ? "#1c2541" : "background.paper",
            border: isDarkMode ? "1px solid #2e3b63" : "none"
          }}>
            <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
              <Avatar
                src={emp.photo ? `${import.meta.env.VITE_API_BASE_URL}/uploads/employees/${emp.photo}` : undefined}
                sx={{ 
                  width: 110, 
                  height: 110, 
                  mx: "auto", 
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                  bgcolor: isDarkMode ? "#243056" : "#eef4ff", 
                  color: isDarkMode ? "#90caf9" : "#1a73e8",
                  fontSize: "2.5rem",
                  fontWeight: 600
                }}
              >
                {emp.full_name ? emp.full_name.substring(0, 2).toUpperCase() : "EM"}
              </Avatar>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: isDarkMode ? "#ffffff" : "#1c2434" }}>
              {emp.full_name}
            </Typography>
            
            <Typography variant="subtitle2" sx={{ color: "#d35465", fontWeight: 700, mb: 1.5, fontSize: "0.9rem" }}>
              {emp.emp_code}
            </Typography>

            <Typography variant="body2" sx={{ color: isDarkMode ? "#cbd5e1" : "text.primary", fontWeight: 500, mb: 0.5 }}>
              {emp.designation}
            </Typography>
            
            <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 2.5 }}>
              {emp.dept_name} Department
            </Typography>

            <Chip
              label={emp.is_active === 1 ? "Active Account" : "Inactive"}
              sx={{
                bgcolor: emp.is_active === 1 ? (isDarkMode ? "rgba(56, 87, 35, 0.3)" : "#e2f0d9") : (isDarkMode ? "rgba(197, 34, 31, 0.2)" : "#fce8e6"),
                color: emp.is_active === 1 ? (isDarkMode ? "#a3e635" : "#385723") : (isDarkMode ? "#f87171" : "#c5221f"),
                fontWeight: 700,
                px: 1,
                borderRadius: 1.5
              }}
            />
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: Details Section Cards */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            
            {/* 1. Personal & Job Details */}
            <Paper sx={{ 
              p: 3, 
              borderRadius: 2, 
              boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
              backgroundColor: isDarkMode ? "#1c2541" : "background.paper",
              border: isDarkMode ? "1px solid #2e3b63" : "none"
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5, color: isDarkMode ? "#90caf9" : "#003566" }}>
                <PersonIcon />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Personal & Position Details</Typography>
              </Box>
              
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={5}>
                  <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 0.5 }}>Full Name</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: isDarkMode ? "#cbd5e1" : "#1c2434" }}>{emp.full_name || "–"}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 0.5 }}>National ID (NIC)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: isDarkMode ? "#cbd5e1" : "#1c2434" }}>{emp.nic || "–"}</Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 0.5 }}>Gender</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: isDarkMode ? "#cbd5e1" : "#1c2434" }}>{emp.gender || "–"}</Typography>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 0.5 }}>Date of Birth</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: isDarkMode ? "#cbd5e1" : "#1c2434" }}>{emp.date_of_birth || "–"}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 0.5 }}>Joined Date</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: isDarkMode ? "#cbd5e1" : "#1c2434" }}>{emp.join_date || "–"}</Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 0.5 }}>Phone Number</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: isDarkMode ? "#cbd5e1" : "#1c2434" }}>{emp.phone || "–"}</Typography>
                </Grid>

                <Grid item xs={12}><Divider sx={{ my: 0.5, borderColor: isDarkMode ? "#2e3b63" : "divider" }} /></Grid>

                <Grid item xs={12} sm={5}>
                  <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 0.5 }}>Email Address</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: isDarkMode ? "#cbd5e1" : "#1c2434" }}>{emp.email || "–"}</Typography>
                </Grid>
                <Grid item xs={12} sm={7}>
                  <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 0.5 }}>Residential Address</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: isDarkMode ? "#cbd5e1" : "#1c2434" }}>{emp.address || "–"}</Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* 2. Financial & Bank Details */}
            <Paper sx={{ 
              p: 3, 
              borderRadius: 2, 
              boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
              backgroundColor: isDarkMode ? "#1c2541" : "background.paper",
              border: isDarkMode ? "1px solid #2e3b63" : "none"
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5, color: isDarkMode ? "#90caf9" : "#003566" }}>
                <AccountBalanceIcon />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Bank Account Details</Typography>
              </Box>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 0.5 }}>Bank Name</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: isDarkMode ? "#cbd5e1" : "#1c2434" }}>{emp.bank_name || "–"}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 0.5 }}>Branch Name</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: isDarkMode ? "#cbd5e1" : "#1c2434" }}>{emp.bank_branch || "–"}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 0.5 }}>Account Number</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: isDarkMode ? "#90caf9" : "#0056b3" }}>{emp.account_number || "–"}</Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* 3. Emergency Contacts */}
            <Paper sx={{ 
              p: 3, 
              borderRadius: 2, 
              boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
              backgroundColor: isDarkMode ? "#1c2541" : "background.paper",
              border: isDarkMode ? "1px solid #2e3b63" : "none"
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5, color: isDarkMode ? "#90caf9" : "#003566" }}>
                <ContactPhoneIcon />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Emergency Contact</Typography>
              </Box>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 0.5 }}>Contact Name</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: isDarkMode ? "#cbd5e1" : "#1c2434" }}>{emp.emergency_name || "–"}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 0.5 }}>Phone Number</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: isDarkMode ? "#cbd5e1" : "#1c2434" }}>{emp.emergency_phone || "–"}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 0.5 }}>Relationship</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: isDarkMode ? "#cbd5e1" : "#1c2434" }}>{emp.emergency_relation || "–"}</Typography>
                </Grid>
              </Grid>
            </Paper>

          </Box>
        </Grid>

      </Grid>
    </Box>
  );
}
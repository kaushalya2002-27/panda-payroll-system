import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  InputAdornment,
  CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router";
import axios from "axios";
import { useTheme } from "@mui/material/styles";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const API_BASE_URL = "http://localhost:8000/api/payroll";

interface Employee {
  id: number;
  emp_code: string;
  full_name: string;
  nic: string;
  dept_name: string;
  designation: string;
  phone: string;
  join_date: string;
  is_active: number;
  email?: string;
  photo?: string;
}

interface Department {
  id: number;
  name: string;
}

export default function AllEmployees() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark"; 

  // Dynamic States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States 
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("all");
  const [status, setStatus] = useState("active");

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search.trim() !== "") params.search = search;
      if (departmentId !== "all") params.dept = departmentId;
      if (status !== "all") params.status = status;

      const response = await axios.get(`${API_BASE_URL}/employees`, { params });
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/departments`);
      setDepartments(response.data);
    } catch (error) {
      setDepartments([
        { id: 1, name: "Administration" },
        { id: 2, name: "Production" },
        { id: 3, name: "Chemical Mng" }
      ]);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const handleFilter = () => {
    fetchEmployees();
  };

  const handleClear = () => {
    setSearch("");
    setDepartmentId("all");
    setStatus("active");
    
    axios.get(`${API_BASE_URL}/employees`, { params: { status: "active" } })
      .then(res => setEmployees(res.data));
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* Page Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ color: isDarkMode ? "#90caf9" : "#0056b3", fontWeight: 700 }}>
          Employees
        </Typography>
        <Typography variant="body2" sx={{ color: isDarkMode ? "#ffffff" : "text.secondary", fontWeight: 500 }}>
          {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </Typography>
      </Box>

      {/* Filter Section Card */}
      <Paper sx={{ 
        p: 2, 
        mb: 4, 
        borderRadius: 2, 
        boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
        backgroundColor: isDarkMode ? "#1c2541" : "background.paper",
        border: isDarkMode ? "1px solid #2e3b63" : "none"
      }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search Input */}
          <Grid item xs={12} md={4}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 0.5 }}>Search</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Name, code, NIC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Department Dropdown */}
          <Grid item xs={12} sm={6} md={2.5}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 0.5 }}>Department</Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <MenuItem value="all">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Status Dropdown */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 0.5 }}>Status</Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12} md={3.5} sx={{ display: "flex", gap: 1, mt: 2.5 }}>
            <Button
              variant="contained"
              size="medium"
              startIcon={<FilterAltIcon />}
              onClick={handleFilter}
              sx={{ bgcolor: "#1a73e8", "&:hover": { bgcolor: "#1557b0" }, textTransform: "none", borderRadius: 1.5, flexGrow: 1 }}
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              size="medium"
              startIcon={<ClearAllIcon />}
              onClick={handleClear}
              sx={{ 
                color: isDarkMode ? "#90caf9" : "#1a73e8", 
                borderColor: isDarkMode ? "#90caf9" : "#1a73e8", 
                "&:hover": { borderColor: isDarkMode ? "#64b5f6" : "#1557b0", bgcolor: isDarkMode ? "rgba(144, 202, 249, 0.08)" : "#f1f7fe" }, 
                textTransform: "none", 
                borderRadius: 1.5 
              }}
            >
              Clear
            </Button>
            <Button
              variant="contained"
              size="medium"
              startIcon={<AddIcon />}
              onClick={() => navigate("/payroll/add-employee")}
              sx={{ bgcolor: isDarkMode ? "#004494" : "#0056b3", "&:hover": { bgcolor: "#003566" }, textTransform: "none", borderRadius: 1.5 }}
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Employees Count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "text.secondary" }}>
          {employees.length} employees found
        </Typography>
      </Box>

      {/* Table Container */}
      <TableContainer component={Paper} sx={{ 
        boxShadow: "0px 2px 8px rgba(0,0,0,0.05)", 
        borderRadius: 2,
        backgroundColor: isDarkMode ? "#1c2541" : "background.paper",
        border: isDarkMode ? "1px solid #2e3b63" : "none"
      }}>
        <Table size="medium">
          <TableHead sx={{ bgcolor: isDarkMode ? "#2e3b63" : "#a0c4ff" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: isDarkMode ? "#ffffff" : "#003566", letterSpacing: "0.5px" }}>EMPLOYEE</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: isDarkMode ? "#ffffff" : "#003566", letterSpacing: "0.5px" }}>CODE</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: isDarkMode ? "#ffffff" : "#003566", letterSpacing: "0.5px" }}>NIC</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: isDarkMode ? "#ffffff" : "#003566", letterSpacing: "0.5px" }}>DEPARTMENT</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: isDarkMode ? "#ffffff" : "#003566", letterSpacing: "0.5px" }}>DESIGNATION</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: isDarkMode ? "#ffffff" : "#003566", letterSpacing: "0.5px" }}>PHONE</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: isDarkMode ? "#ffffff" : "#003566", letterSpacing: "0.5px" }}>JOINED</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: isDarkMode ? "#ffffff" : "#003566", letterSpacing: "0.5px" }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: isDarkMode ? "#ffffff" : "#003566", letterSpacing: "0.5px", textAlign: "center" }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((row) => (
                <TableRow key={row.id} hover sx={{ "&:hover": { backgroundColor: isDarkMode ? "#243056 !important" : "inherit" } }}>
                  <TableCell sx={{ borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar 
                        src={row.photo ? `http://localhost:8000/uploads/employees/${row.photo}` : undefined}
                        sx={{ width: 32, height: 32, fontSize: "0.85rem", bgcolor: isDarkMode ? "#243056" : "#eef4ff", color: isDarkMode ? "#90caf9" : "#1a73e8", fontWeight: 600 }}
                      >
                        {row.full_name ? row.full_name.substring(0, 2).toUpperCase() : "EM"}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: isDarkMode ? "#cbd5e1" : "#1c2434" }}>
                          {row.full_name}
                        </Typography>
                        {row.email && (
                          <Typography variant="caption" color={isDarkMode ? "#94a3b8" : "text.secondary"} display="block">
                            {row.email}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit" }}>
                    <Typography variant="body2" sx={{ color: "#d35465", fontWeight: 600, fontSize: "0.85rem" }}>
                      {row.emp_code}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit" }}><Typography variant="body2" sx={{ color: isDarkMode ? "#cbd5e1" : "#1c2434" }}>{row.nic}</Typography></TableCell>
                  <TableCell sx={{ borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit" }}><Typography variant="body2" sx={{ color: isDarkMode ? "#cbd5e1" : "#1c2434" }}>{row.dept_name}</Typography></TableCell>
                  <TableCell sx={{ borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit" }}><Typography variant="body2" sx={{ color: isDarkMode ? "#cbd5e1" : "#1c2434" }}>{row.designation}</Typography></TableCell>
                  <TableCell sx={{ borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit" }}><Typography variant="body2" sx={{ color: isDarkMode ? "#cbd5e1" : "#1c2434" }}>{row.phone}</Typography></TableCell>
                  <TableCell sx={{ borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit" }}><Typography variant="body2" color={isDarkMode ? "#94a3b8" : "text.secondary"}>{row.join_date}</Typography></TableCell>

                  <TableCell sx={{ borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit" }}>
                    <Chip
                      label={row.is_active === 1 ? "Active" : "Inactive"}
                      size="small"
                      sx={{
                        bgcolor: row.is_active === 1 ? (isDarkMode ? "rgba(56, 87, 35, 0.3)" : "#e2f0d9") : (isDarkMode ? "rgba(197, 34, 31, 0.2)" : "#fce8e6"),
                        color: row.is_active === 1 ? (isDarkMode ? "#a3e635" : "#385723") : (isDarkMode ? "#f87171" : "#c5221f"),
                        fontWeight: 600,
                        borderRadius: 1
                      }}
                    />
                  </TableCell>

                  <TableCell sx={{ borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit", textAlign: "center" }}>
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                      {/* View Button  */}
                      <IconButton 
                        size="small" 
                        title="View Profile" 
                        onClick={() => navigate(`/payroll/employees/${row.id}`)}
                        sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", opacity: 0.8, "&:hover": { color: isDarkMode ? "#ffffff" : "initial" } }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>

                      {/* Edit Button  */}
                      <IconButton 
                        size="small" 
                        title="Edit" 
                        onClick={() => navigate(`/payroll/employees/${row.id}/edit`)}
                        sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", opacity: 0.8, "&:hover": { color: isDarkMode ? "#ffffff" : "initial" } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>

                      {/* Time Card Button */}
                      <IconButton 
                        size="small" 
                        title="Time Card" 
                        onClick={() => {
                          const currentYear = new Date().getFullYear();
                          const currentMonth = new Date().toLocaleDateString("en-US", { month: "long" }); 
                          navigate(`/payroll/time-cards?emp=${row.id}&year=${currentYear}&month=${currentMonth}`);
                        }}
                        sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", opacity: 0.8, "&:hover": { color: isDarkMode ? "#ffffff" : "initial" } }}
                      >
                        <AccessTimeIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
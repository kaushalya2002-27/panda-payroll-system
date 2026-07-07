import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tabs,
  Tab
} from "@mui/material";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ClearIcon from "@mui/icons-material/Clear";
import { useTheme } from "@mui/material/styles";

// Interfaces
interface DepartmentType {
  id: number;
  name: string;
  active_employees_count?: number; 
}

interface JobPositionType {
  id: number;
  name: string;
}

export default function Departments() {
  const theme = useTheme(); 
  const isDarkMode = theme.palette.mode === "dark"; 

  // Tab State ('departments' = 0, 'positions' = 1)
  const [activeTab, setActiveTab] = useState<number>(0);

  // --- Departments States & Logic  ---
  const [deptName, setDeptName] = useState<string>("");
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [editId, setEditId] = useState<number | null>(null);

  // --- Job Positions States (Dan Backend ekt connect kළා) ---
  const [positionName, setPositionName] = useState<string>("");
  const [jobPositions, setJobPositions] = useState<JobPositionType[]>([]);
  const [editPositionId, setEditPositionId] = useState<number | null>(null);

  const fetchDepartments = () => {
    axios
      .get("http://localhost:8000/api/payroll/departments")
      .then((res) => {
        const formattedData = res.data.map((dept: any) => ({
          ...dept,
          active_employees_count: dept.active_employees_count ? Number(dept.active_employees_count) : 0,
        }));
        setDepartments(formattedData);
      })
      .catch((err) => console.error("Error fetching departments:", err));
  };

  const fetchJobPositions = () => {
    axios
      .get("http://localhost:8000/api/payroll/job-positions")
      .then((res) => {
        setJobPositions(res.data);
      })
      .catch((err) => console.error("Error fetching job positions:", err));
  };

  useEffect(() => {
    fetchDepartments();
    fetchJobPositions(); 
  }, []);

  const handleSave = () => {
    if (!deptName.trim()) {
      alert("Please enter a department name");
      return;
    }

    const payload = { name: deptName };

    if (editId) {
      axios
        .put(`http://localhost:8000/api/payroll/departments/${editId}`, payload)
        .then(() => {
          fetchDepartments();
          handleClear();
        })
        .catch((err) => console.error("Error updating department:", err));
    } else {
      axios
        .post("http://localhost:8000/api/payroll/departments", payload)
        .then(() => {
          fetchDepartments();
          handleClear();
        })
        .catch((err) => console.error("Error creating department:", err));
    }
  };

  const handleEdit = (dept: DepartmentType) => {
    setEditId(dept.id);
    setDeptName(dept.name);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      axios
        .delete(`http://localhost:8000/api/payroll/departments/${id}`)
        .then(() => {
          fetchDepartments();
        })
        .catch((err) => console.error("Error deleting department:", err));
    }
  };

  const handleClear = () => {
    setEditId(null);
    setDeptName("");
  };

  // --- Job Positions Handlers  ---
  const handleSavePosition = () => {
    if (!positionName.trim()) {
      alert("Please enter a job position name");
      return;
    }

    const payload = { name: positionName };

    if (editPositionId) {
      axios
        .put(`http://localhost:8000/api/payroll/job-positions/${editPositionId}`, payload)
        .then(() => {
          fetchJobPositions();
          handleClearPosition();
        })
        .catch((err) => console.error("Error updating job position:", err));
    } else {
      axios
        .post("http://localhost:8000/api/payroll/job-positions", payload)
        .then(() => {
          fetchJobPositions();
          handleClearPosition();
        })
        .catch((err) => console.error("Error creating job position:", err));
    }
  };

  const handleEditPosition = (pos: JobPositionType) => {
    setEditPositionId(pos.id);
    setPositionName(pos.name);
  };

  const handleDeletePosition = (id: number) => {
    if (window.confirm("Are you sure you want to delete this job position?")) {
      axios
        .delete(`http://localhost:8000/api/payroll/job-positions/${id}`)
        .then(() => {
          fetchJobPositions();
        })
        .catch((err) => console.error("Error deleting job position:", err));
    }
  };

  const handleClearPosition = () => {
    setEditPositionId(null);
    setPositionName("");
  };

  return (
    <Box sx={{ p: 3, bgcolor: isDarkMode ? "transparent" : "#f8f9fa", minHeight: "100vh" }}>
      
      {/* Page Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ color: isDarkMode ? "#90caf9" : "#1e293b", fontWeight: 700, fontSize: "1.5rem" }}>
          Departments & Positions
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: isDarkMode ? "#2e3b63" : "#e2e8f0", mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Departments" sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.9rem" }} />
          <Tab label="Job Positions" sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.9rem" }} />
        </Tabs>
      </Box>

      {/* Main Content Layout based on Active Tab */}
      {activeTab === 0 ? (
        /*  DEPARTMENTS TAB  */
        <Grid container spacing={3}>
          {/* Left Column: Departments Table */}
          <Grid item xs={12} lg={7.5}>
            <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)", border: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0", backgroundColor: isDarkMode ? "#1c2541" : "background.paper" }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ color: isDarkMode ? "#cbd5e1" : "#1e293b", fontWeight: 700 }}>
                  Available Departments
                </Typography>              
              </Box>

              <TableContainer sx={{ border: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0", borderRadius: 1.5 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ "& th": { bgcolor: isDarkMode ? "#131a30" : "#aacdfa", color: isDarkMode ? "#024271" : "#024271", fontWeight: 700, fontSize: "0.75rem", py: 1.5 } }}>
                      <TableCell align="center" sx={{ width: "80px" }}>#</TableCell>
                      <TableCell>DEPARTMENT NAME</TableCell>
                      <TableCell align="center" sx={{ width: "160px" }}>ACTIVE EMPLOYEES</TableCell>
                      <TableCell align="center" sx={{ width: "120px" }}>ACTION</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3, color: isDarkMode ? "#94a3b8" : "#64748b" }}>
                          No departments found. Add a new one!
                        </TableCell>
                      </TableRow>
                    ) : (
                      departments.map((row, index) => (
                        <TableRow key={row.id} hover sx={{ "& td": { py: 1.2, borderBottom: isDarkMode ? "1px solid #2e3b63" : "1px solid #f1f5f9", color: isDarkMode ? "#cbd5e1" : "inherit" } }}>
                          <TableCell align="center" sx={{ color: isDarkMode ? "#94a3b8" : "#64748b", fontSize: "0.8rem" }}>{index + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: isDarkMode ? "#fff" : "#1e293b", fontSize: "0.85rem" }}>{row.name}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={`${row.active_employees_count || 0} Members`} 
                              size="small" 
                              variant={isDarkMode ? "outlined" : "filled"}
                              color="primary"
                              sx={{ 
                                fontWeight: 600, fontSize: "0.75rem", height: "20px", borderRadius: "6px",
                                ...(!isDarkMode && {
                                  bgcolor: "#e0f2fe", 
                                  color: "#0369a1", 
                                })
                              }} 
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                              <IconButton 
                                size="small" 
                                onClick={() => handleEdit(row)}
                                sx={{ border: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0", borderRadius: 1.2, p: 0.5, color: isDarkMode ? "#94a3b8" : "#64748b", "&:hover": { bgcolor: isDarkMode ? "#131a30" : "#f1f5f9" } }}
                              >
                                <EditIcon sx={{ fontSize: "0.95rem" }} />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDelete(row.id)}
                                sx={{ border: isDarkMode ? "1px solid #5a2323" : "1px solid #fee2e2", borderRadius: 1.2, p: 0.5, color: "#ef4444", "&:hover": { bgcolor: isDarkMode ? "#3a1818" : "#fef2f2" } }}
                              >
                                <DeleteIcon sx={{ fontSize: "0.95rem" }} />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Right Column: Add / Edit Department Form */}
          <Grid item xs={12} lg={4.5}>
            <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)", border: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0", backgroundColor: isDarkMode ? "#1c2541" : "background.paper" }}>
              <Typography variant="subtitle1" sx={{ color: isDarkMode ? "#cbd5e1" : "#1e293b", fontWeight: 700, mb: 2.5 }}>
                {editId ? "Edit Department" : "Add Department"}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "#475569", display: "block", mb: 0.5 }}>
                    Department Name <span style={{ color: "#ef4444" }}>*</span>
                  </Typography>
                  <TextField 
                    fullWidth 
                    size="small" 
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="Enter department name"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5, backgroundColor: isDarkMode ? "#131a30" : "#ffffff", "& fieldset": { borderColor: isDarkMode ? "#2e3b63" : "#ced4da" } }, "& .MuiInputBase-input": { color: isDarkMode ? "#fff" : "inherit" } }} 
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 1.5, mt: 0.5 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    size="small"
                    onClick={handleSave}
                    sx={{ bgcolor: "#1976d2", "&:hover": { bgcolor: "#1565c0" }, textTransform: "none", flex: 1, borderRadius: 1.5, fontWeight: 600, py: 0.8 }}
                  >
                    {editId ? "Update" : "Save"}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    size="small"
                    onClick={handleClear}
                    sx={{ color: isDarkMode ? "#94a3b8" : "#64748b", borderColor: isDarkMode ? "#2e3b63" : "#cbd5e1", "&:hover": { borderColor: isDarkMode ? "#475569" : "#94a3b8", bgcolor: isDarkMode ? "#131a30" : "#f8fafc" }, textTransform: "none", flex: 1, borderRadius: 1.5, fontWeight: 600, py: 0.8 }}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        /*  JOB POSITIONS TAB  */
        <Grid container spacing={3}>
          {/* Left Column: Job Positions Table */}
          <Grid item xs={12} lg={7.5}>
            <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)", border: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0", backgroundColor: isDarkMode ? "#1c2541" : "background.paper" }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ color: isDarkMode ? "#cbd5e1" : "#1e293b", fontWeight: 700 }}>
                  Available Job Positions
                </Typography>              
              </Box>

              <TableContainer sx={{ border: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0", borderRadius: 1.5 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ "& th": { bgcolor: isDarkMode ? "#131a30" : "#aacdfa", color: isDarkMode ? "#024271" : "#024271", fontWeight: 700, fontSize: "0.75rem", py: 1.5 } }}>
                      <TableCell align="center" sx={{ width: "80px" }}>#</TableCell>
                      <TableCell>JOB POSITION NAME</TableCell>
                      <TableCell align="center" sx={{ width: "120px" }}>ACTION</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jobPositions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 3, color: isDarkMode ? "#94a3b8" : "#64748b" }}>
                          No job positions found. Add a new one!
                        </TableCell>
                      </TableRow>
                    ) : (
                      jobPositions.map((row, index) => (
                        <TableRow key={row.id} hover sx={{ "& td": { py: 1.2, borderBottom: isDarkMode ? "1px solid #2e3b63" : "1px solid #f1f5f9", color: isDarkMode ? "#cbd5e1" : "inherit" } }}>
                          <TableCell align="center" sx={{ color: isDarkMode ? "#94a3b8" : "#64748b", fontSize: "0.8rem" }}>{index + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: isDarkMode ? "#fff" : "#1e293b", fontSize: "0.85rem" }}>{row.name}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                              <IconButton 
                                size="small" 
                                onClick={() => handleEditPosition(row)}
                                sx={{ border: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0", borderRadius: 1.2, p: 0.5, color: isDarkMode ? "#94a3b8" : "#64748b", "&:hover": { bgcolor: isDarkMode ? "#131a30" : "#f1f5f9" } }}
                              >
                                <EditIcon sx={{ fontSize: "0.95rem" }} />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeletePosition(row.id)}
                                sx={{ border: isDarkMode ? "1px solid #5a2323" : "1px solid #fee2e2", borderRadius: 1.2, p: 0.5, color: "#ef4444", "&:hover": { bgcolor: isDarkMode ? "#3a1818" : "#fef2f2" } }}
                              >
                                <DeleteIcon sx={{ fontSize: "0.95rem" }} />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Right Column: Add / Edit Job Position Form */}
          <Grid item xs={12} lg={4.5}>
            <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)", border: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0", backgroundColor: isDarkMode ? "#1c2541" : "background.paper" }}>
              <Typography variant="subtitle1" sx={{ color: isDarkMode ? "#cbd5e1" : "#1e293b", fontWeight: 700, mb: 2.5 }}>
                {editPositionId ? "Edit Job Position" : "Add Job Position"}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "#475569", display: "block", mb: 0.5 }}>
                    Job Position Name <span style={{ color: "#ef4444" }}>*</span>
                  </Typography>
                  <TextField 
                    fullWidth 
                    size="small" 
                    value={positionName}
                    onChange={(e) => setPositionName(e.target.value)}
                    placeholder="Enter job position name"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5, backgroundColor: isDarkMode ? "#131a30" : "#ffffff", "& fieldset": { borderColor: isDarkMode ? "#2e3b63" : "#ced4da" } }, "& .MuiInputBase-input": { color: isDarkMode ? "#fff" : "inherit" } }} 
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 1.5, mt: 0.5 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    size="small"
                    onClick={handleSavePosition}
                    sx={{ bgcolor: "#1976d2", "&:hover": { bgcolor: "#1565c0" }, textTransform: "none", flex: 1, borderRadius: 1.5, fontWeight: 600, py: 0.8 }}
                  >
                    {editPositionId ? "Update" : "Save"}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    size="small"
                    onClick={handleClearPosition}
                    sx={{ color: isDarkMode ? "#94a3b8" : "#64748b", borderColor: isDarkMode ? "#2e3b63" : "#cbd5e1", "&:hover": { borderColor: isDarkMode ? "#475569" : "#94a3b8", bgcolor: isDarkMode ? "#131a30" : "#f8fafc" }, textTransform: "none", flex: 1, borderRadius: 1.5, fontWeight: 600, py: 0.8 }}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
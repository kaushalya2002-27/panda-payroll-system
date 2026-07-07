import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router";
import axios from "axios";
import { useTheme } from "@mui/material/styles"; 

// Icons
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";

export default function PayrollDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark"; 

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8000/api/payroll/dashboard")
      .then((response) => {
        if (response.data.success) {
          setDashboardData(response.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Dashboard data fetching error:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const cards = dashboardData?.cards || {
    active_employees: "0",
    departments: "0",
    current_month: "-",
    total_payroll: "Rs. 0.00"
  };

  const recentEmployees = dashboardData?.recent_employees || [];
  const summaryCards = [
    { title: "ACTIVE EMPLOYEES", value: cards.active_employees, icon: <PeopleAltIcon sx={{ color: isDarkMode ? "#90caf9" : "#1a73e8" }} />, bgColor: isDarkMode ? "rgba(26, 115, 232, 0.15)" : "#e8f0fe" },
    { title: "DEPARTMENTS", value: cards.departments, icon: <BusinessIcon sx={{ color: isDarkMode ? "#a78bfa" : "#0056b3" }} />, bgColor: isDarkMode ? "rgba(139, 92, 246, 0.15)" : "#eef4ff" },
    { title: "CURRENT MONTH", value: cards.current_month, icon: <CalendarMonthIcon sx={{ color: isDarkMode ? "#90caf9" : "#1a73e8" }} />, bgColor: isDarkMode ? "rgba(26, 115, 232, 0.15)" : "#e8f0fe" },
    { title: "MONTH PAYROLL", value: cards.total_payroll, icon: <AccountBalanceWalletIcon sx={{ color: isDarkMode ? "#90caf9" : "#1a73e8" }} />, bgColor: isDarkMode ? "rgba(26, 115, 232, 0.15)" : "#e8f0fe" }
  ];

  const quickActions = [
    { text: "Enter Time Cards", path: "/payroll/time-cards", icon: <DynamicFeedIcon fontSize="small" sx={{ color: isDarkMode ? "#90caf9" : "#1a73e8" }} /> },
    { text: "Monthly Summary", path: "/payroll/summary", icon: <DynamicFeedIcon fontSize="small" sx={{ color: isDarkMode ? "#90caf9" : "#1a73e8" }} /> },
    { text: "Print Pay Slips", path: "/payroll/slips", icon: <DynamicFeedIcon fontSize="small" sx={{ color: isDarkMode ? "#90caf9" : "#1a73e8" }} /> },
    { text: "Detail Sheets", path: "/payroll/detail-sheets", icon: <DynamicFeedIcon fontSize="small" sx={{ color: isDarkMode ? "#90caf9" : "#1a73e8" }} /> },
    { text: "Add Employee", path: "/payroll/add-employee", icon: <PersonAddAltIcon fontSize="small" sx={{ color: isDarkMode ? "#90caf9" : "#1a73e8" }} /> },
  ];

  return (
    <Box sx={{ p: 1 }}>
      {/* Top Header Row */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ color: isDarkMode ? "#90caf9" : "#0056b3", fontWeight: 700 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: isDarkMode ? "#ffffff" : "text.secondary", fontWeight: 500 }}>
          {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </Typography>
      </Box>

      {/* 4 Summary Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              boxShadow: "0px 2px 8px rgba(0,0,0,0.05)", 
              borderRadius: 2,
              backgroundColor: isDarkMode ? "#1c2541" : "background.paper",
              border: isDarkMode ? "1px solid #2e3b63" : "none"
            }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: "20px !important" }}>
                <Avatar sx={{ bgcolor: card.bgColor, width: 48, height: 48, borderRadius: 2 }}>
                  {card.icon}
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", fontWeight: 600, letterSpacing: 0.5 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: isDarkMode ? "#ffffff" : "#1c2434" }}>
                    {card.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions & Recent Employees Section */}
      <Grid container spacing={3}>
        
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: isDarkMode ? "#ffffff" : "#1c2434" }}>
            Quick Actions
          </Typography>
          <Paper sx={{ 
            boxShadow: "0px 2px 8px rgba(0,0,0,0.05)", 
            borderRadius: 2, 
            overflow: "hidden",
            backgroundColor: isDarkMode ? "#1c2541" : "background.paper",
            border: isDarkMode ? "1px solid #2e3b63" : "none"
          }}>
            <List disablePadding>
              {quickActions.map((action, index) => (
                <React.Fragment key={index}>
                  <ListItem disablePadding>
                    <ListItemButton sx={{ py: 1.5, "&:hover": { backgroundColor: isDarkMode ? "#243056" : "#f1f5f9" } }} onClick={() => navigate(action.path)}>
                      <ListItemIcon sx={{ minWidth: 35 }}>
                        {action.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={action.text} 
                        primaryTypographyProps={{ variant: "body2", fontWeight: 500, color: isDarkMode ? "#cbd5e1" : "inherit" }} 
                      />
                      <ArrowForwardIosIcon sx={{ fontSize: 12, color: isDarkMode ? "#94a3b8" : "text.disabled" }} />
                    </ListItemButton>
                  </ListItem>
                  {index < quickActions.length - 1 && <Divider sx={{ borderColor: isDarkMode ? "#2e3b63" : "divider" }} />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Employees Table */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: isDarkMode ? "#ffffff" : "#1c2434" }}>
              Recently Added Employees
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => navigate("/payroll/employees")}
              sx={{ 
                textTransform: "none", 
                borderRadius: 1.5, 
                color: isDarkMode ? "#90caf9" : "#1a73e8", 
                borderColor: isDarkMode ? "#90caf9" : "#1a73e8", 
                "&:hover": { borderColor: isDarkMode ? "#64b5f6" : "#1557b0", bgcolor: isDarkMode ? "rgba(144, 202, 249, 0.08)" : "#f1f7fe" } 
              }}
            >
              View All
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ 
            boxShadow: "0px 2px 8px rgba(0,0,0,0.05)", 
            borderRadius: 2,
            backgroundColor: isDarkMode ? "#1c2541" : "background.paper",
            border: isDarkMode ? "1px solid #2e3b63" : "none"
          }}>
            <Table size="medium">
              <TableHead sx={{ bgcolor: isDarkMode ? "#2e3b63" : "#a0c4ff" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: isDarkMode ? "#ffffff" : "#003566" }}>EMPLOYEE</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: isDarkMode ? "#ffffff" : "#003566" }}>CODE</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: isDarkMode ? "#ffffff" : "#003566" }}>DEPARTMENT</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: isDarkMode ? "#ffffff" : "#003566" }}>JOINED</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentEmployees.map((row, index) => (
                  <TableRow key={index} hover sx={{ "&:last-child td, &:last-child th": { border: 0 }, "&:hover": { backgroundColor: isDarkMode ? "#243056 !important" : "inherit" } }}>
                    <TableCell sx={{ borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar 
                          src={row.photo ? `http://localhost:8000/uploads/employees/${row.photo}` : undefined} 
                          sx={{ width: 32, height: 32, fontSize: "0.85rem", bgcolor: isDarkMode ? "#243056" : "#eef4ff", color: isDarkMode ? "#90caf9" : "#1a73e8", fontWeight: 600 }}
                        >
                          {row.name ? row.name.charAt(0).toUpperCase() : "E"}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: isDarkMode ? "#cbd5e1" : "#1c2434" }}>
                          {row.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit" }}>
                      <Typography variant="body2" sx={{ color: "#d35465", fontWeight: 600, fontSize: "0.85rem" }}>
                        {row.code}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit" }}>
                      <Typography variant="body2" sx={{ color: isDarkMode ? "#cbd5e1" : "text.primary" }}>
                        {row.dept}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit" }}>
                      <Typography variant="body2" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary" }}>
                        {row.joined}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

      </Grid>
    </Box>
  );
}
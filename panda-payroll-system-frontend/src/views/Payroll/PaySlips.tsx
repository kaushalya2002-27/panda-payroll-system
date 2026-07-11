import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  CircularProgress
} from "@mui/material";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import axios from "axios";
import { useTheme } from "@mui/material/styles"; 

interface SlipData {
  employee: { name: string; code: string; department: string; designation: string; nic: string };
  period: { month_year: string; days_worked: number; days_leave: number };
  products: Array<{ product_name: string; total_units: number }>;
  earnings: {
    production_allowance: number;
    overtime_allowance: number;
    day_duty_allowance: number;
    travelling_allowance: number;
    other_allowances: number;
    gross_pay: number;
  };
}

export default function PaySlip() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark"; 

  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(
    ["January","February","March","April","May","June","July","August","September","October","November","December"][new Date().getMonth()]
  );
  const [slipData, setSlipData] = useState<SlipData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/payroll/employees`)
      .then(res => {
        const empList = res.data.data || res.data;
        setEmployees(empList);

        const queryParams = new URLSearchParams(window.location.search);
        const urlEmpId = queryParams.get("employee_id");
        const urlYear = queryParams.get("year");
        const urlMonth = queryParams.get("month");

        if (urlEmpId) {
          setSelectedEmpId(urlEmpId);
        } else if (empList.length > 0) {
          setSelectedEmpId(empList[0].id);
        }

        if (urlYear) setYear(urlYear);
        
        if (urlMonth) {
          const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
          
          const monthIdx = parseInt(urlMonth, 10) - 1;
          if (monthIdx >= 0 && monthIdx < 12) {
            setMonth(monthNames[monthIdx]);
          } else {
            setMonth(urlMonth);
          }
        }
      })
      .catch(err => console.error("Error fetching employees", err));
  }, []);

  useEffect(() => {
    if (!selectedEmpId) return;

    setLoading(true);
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/payroll/pay-slip`, {
      params: { employee_id: selectedEmpId, year, month }
    })
    .then(res => {
      if (res.data.success) {
        setSlipData(res.data);
      } else {
        setSlipData(null);
      }
    })
    .catch(err => {
      console.error("Error fetching slip data", err);
      setSlipData(null);
    })
    .finally(() => setLoading(false));
  }, [selectedEmpId, year, month]);

  const filterInputStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: isDarkMode ? "#131a30" : "#ffffff",
      "& fieldset": { borderColor: isDarkMode ? "#2e3b63" : "#ced4da" },
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: isDarkMode ? "transparent" : "#f8f9fa", minHeight: "100vh" }}>
      
      <style>{`
        @media print {
          @page { 
            size: A4 portrait;
            margin: 0 !important; 
          }
          
          nav, aside, .no-print, header, [role="navigation"], .MuiDrawer-root, 
          div[class*="sidebar"], div[class*="navbar"], .css-10nre8a, .css-1p823v2,
          [class*="Sidebar"], [class*="Navbar"], [class*="Header"] {
            display: none !important;
          }
          
          html, body, #root, __next, main, [class*="MuiBox-root"], .print-container {
            background: #fff !important;
            background-color: #fff !important;
            color: #000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            box-shadow: none !important;
            border: none !important;
            position: static !important;
            transform: none !important;
          }
          
          .print-container {
            max-width: 100% !important;
            width: 100% !important;
            padding: 15mm !important; 
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
          }

          .print-container *, .text-print-black {
            color: #000 !important;
          }
          
          .MuiTableContainer-root, table, tr, td {
            background: #fff !important;
            background-color: #fff !important;
            color: #000 !important;
            border-color: #e2e8f0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .text-navy-print {
            color: #024271 !important;
          }

          tr.gross-print-row, tr.gross-print-row td, .gross-print-bg {
            background-color: #f8fafc !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .MuiPaper-root { box-shadow: none !important; border: none !important; }
          .MuiDivider-root { borderColor: #cbd5e1 !important; }
        }
      `}</style>

      {/* Title Area */}
      <Box sx={{ mb: 3 }} className="no-print">
        <Typography variant="h5" sx={{ color: isDarkMode ? "#90caf9" : "#1e293b", fontWeight: 700 }}>
          Pay Slip
        </Typography>        
      </Box>

      {/* Filter Panel */}
      <Paper className="no-print" sx={{ p: 2.5, mb: 4, borderRadius: 2, border: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0", backgroundColor: isDarkMode ? "#1c2541" : "background.paper" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "#475569" }}>Employee</Typography>
            <TextField select fullWidth size="small" value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)} sx={filterInputStyles}>
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.emp_code} - {emp.full_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "#475569" }}>Year</Typography>
            <TextField select fullWidth size="small" value={year} onChange={(e) => setYear(e.target.value)} sx={filterInputStyles}>
              <MenuItem value="2025">2025</MenuItem>
              <MenuItem value="2026">2026</MenuItem>
              <MenuItem value="2027">2027</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "#475569" }}>Month</Typography>
            <TextField select fullWidth size="small" value={month} onChange={(e) => setMonth(e.target.value)} sx={filterInputStyles}>
              <MenuItem value="January">January</MenuItem>
              <MenuItem value="February">February</MenuItem>
              <MenuItem value="March">March</MenuItem>
              <MenuItem value="April">April</MenuItem>
              <MenuItem value="May">May</MenuItem>
              <MenuItem value="June">June</MenuItem>
              <MenuItem value="July">July</MenuItem>
              <MenuItem value="August">August</MenuItem>
              <MenuItem value="September">September</MenuItem>
              <MenuItem value="October">October</MenuItem>
              <MenuItem value="November">November</MenuItem>
              <MenuItem value="December">December</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: "flex", mt: 2 }}>
            <Button variant="contained" startIcon={<LocalPrintshopIcon />} onClick={() => window.print()} sx={{ textTransform: "none", px: 4, bgcolor: "#1976d2", "&:hover": { bgcolor: "#1565c0" } }}>
              Print Pay Slip
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Sheet View */}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        {loading ? (
          <CircularProgress />
        ) : slipData ? (
          <Paper className="print-container" sx={{ p: 4, width: "100%", maxWidth: "750px", borderRadius: 2, border: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0", bgcolor: isDarkMode ? "#1c2541" : "#fff" }}>
            
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Box>
                <Typography variant="h5" className="text-navy-print" sx={{ color: isDarkMode ? "#90caf9" : "#024271", fontWeight: 700 }}>Panda Consumer Products</Typography>
                <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}>Payroll Division</Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="subtitle1" className="text-navy-print" sx={{ fontWeight: 700, color: isDarkMode ? "#cbd5e1" : "text.primary" }}>PAY SLIP</Typography>
                <Typography variant="body2" sx={{ color: isDarkMode ? "#94a3b8" : "#64748b", fontWeight: 600 }}>
                  {month} {year}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3, borderColor: isDarkMode ? "#2e3b63" : "divider" }} />

            {/* Metadata */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="body2" sx={{ color: isDarkMode ? "#cbd5e1" : "text.primary" }}><b>Employee Name:</b> {slipData.employee.name}</Typography>
                  <Typography variant="body2" sx={{ color: isDarkMode ? "#cbd5e1" : "text.primary" }}><b>Employee Code:</b> {slipData.employee.code}</Typography>
                  <Typography variant="body2" sx={{ color: isDarkMode ? "#cbd5e1" : "text.primary" }}><b>Department:</b> {slipData.employee.department}</Typography>
                  <Typography variant="body2" sx={{ color: isDarkMode ? "#cbd5e1" : "text.primary" }}><b>Designation:</b> {slipData.employee.designation}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="body2" sx={{ color: isDarkMode ? "#cbd5e1" : "text.primary" }}><b>Pay Period:</b> {month} {year}</Typography>
                  <Typography variant="body2" sx={{ color: isDarkMode ? "#cbd5e1" : "text.primary" }}><b>Days Worked:</b> {slipData.period.days_worked}</Typography>
                  <Typography variant="body2" sx={{ color: isDarkMode ? "#cbd5e1" : "text.primary" }}><b>Days Leave:</b> {slipData.period.days_leave}</Typography>
                  <Typography variant="body2" sx={{ color: isDarkMode ? "#cbd5e1" : "text.primary" }}><b>NIC:</b> {slipData.employee.nic}</Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Earnings Table */}
            <Typography variant="caption" className="text-navy-print" sx={{ color: isDarkMode ? "#90caf9" : "#024271", fontWeight: 700, display: "block", mb: 1 }}>EARNINGS</Typography>
            <TableContainer sx={{ borderTop: isDarkMode ? "2px solid #2e3b63" : "2px solid #aacdfa", mb: 4 }}>
              <Table size="small">
                <TableBody>
                  {slipData.products.map((p, idx) => (
                    <TableRow key={idx} sx={{ "& td": { borderBottom: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0" } }}>
                      <TableCell sx={{ pl: 0, color: isDarkMode ? "#cbd5e1" : "text.primary" }}>{p.product_name} ({parseInt(p.total_units.toString())} units)</TableCell>
                      <TableCell align="right" sx={{ pr: 0, color: isDarkMode ? "#94a3b8" : "text.secondary" }}>—</TableCell>
                    </TableRow>
                  ))}
                  
                  <TableRow sx={{ "& td": { borderBottom: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0" } }}>
                    <TableCell sx={{ pl: 0, color: isDarkMode ? "#cbd5e1" : "text.primary" }}>Production Allowance</TableCell>
                    <TableCell align="right" sx={{ pr: 0, color: isDarkMode ? "#cbd5e1" : "text.primary" }}>Rs. {slipData.earnings.production_allowance.toLocaleString('en-US', {minimumFractionDigits: 2})}</TableCell>
                  </TableRow>
                  <TableRow sx={{ "& td": { borderBottom: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0" } }}>
                    <TableCell sx={{ pl: 0, color: isDarkMode ? "#cbd5e1" : "text.primary" }}>Overtime Allowance</TableCell>
                    <TableCell align="right" sx={{ pr: 0, color: isDarkMode ? "#cbd5e1" : "text.primary" }}>Rs. {slipData.earnings.overtime_allowance.toLocaleString('en-US', {minimumFractionDigits: 2})}</TableCell>
                  </TableRow>
                  <TableRow sx={{ "& td": { borderBottom: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0" } }}>
                    <TableCell sx={{ pl: 0, color: isDarkMode ? "#cbd5e1" : "text.primary" }}>Day Duty Allowance</TableCell>
                    <TableCell align="right" sx={{ pr: 0, color: isDarkMode ? "#cbd5e1" : "text.primary" }}>Rs. {slipData.earnings.day_duty_allowance.toLocaleString('en-US', {minimumFractionDigits: 2})}</TableCell>
                  </TableRow>
                  <TableRow sx={{ "& td": { borderBottom: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0" } }}>
                    <TableCell sx={{ pl: 0, color: isDarkMode ? "#cbd5e1" : "text.primary" }}>Travelling Allowance</TableCell>
                    <TableCell align="right" sx={{ pr: 0, color: isDarkMode ? "#cbd5e1" : "text.primary" }}>Rs. {slipData.earnings.travelling_allowance.toLocaleString('en-US', {minimumFractionDigits: 2})}</TableCell>
                  </TableRow>
                  <TableRow sx={{ "& td": { borderBottom: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0" } }}>
                    <TableCell sx={{ pl: 0, color: isDarkMode ? "#cbd5e1" : "text.primary" }}>Other Allowances</TableCell>
                    <TableCell align="right" sx={{ pr: 0, color: isDarkMode ? "#cbd5e1" : "text.primary" }}>Rs. {slipData.earnings.other_allowances.toLocaleString('en-US', {minimumFractionDigits: 2})}</TableCell>
                  </TableRow>

                  <TableRow className="gross-print-row" sx={{ bgcolor: isDarkMode ? "#131a30" : "#f8fafc" }}>
                    <TableCell className="text-navy-print" sx={{ color: isDarkMode ? "#90caf9" : "#024271", fontWeight: 700, pl: 0, fontSize: "0.95rem", borderBottom: "none" }}>GROSS PAY</TableCell>
                    <TableCell align="right" sx={{ color: isDarkMode ? "#81c784" : "#2e7d32", fontWeight: 700, pr: 0, fontSize: "0.95rem", borderBottom: "none" }}>
                      Rs. {slipData.earnings.gross_pay.toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Signatures */}
            <Grid container spacing={8} sx={{ mt: 2 }}>
              <Grid item xs={6} sx={{ textAlign: "center" }}><Box sx={{ borderTop: isDarkMode ? "1px solid #2e3b63" : "1px solid #cbd5e1", pt: 1 }}><Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary" }}>Employee Signature</Typography></Box></Grid>
              <Grid item xs={6} sx={{ textAlign: "center" }}><Box sx={{ borderTop: isDarkMode ? "1px solid #2e3b63" : "1px solid #cbd5e1", pt: 1 }}><Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary" }}>Authorised Signature</Typography></Box></Grid>
            </Grid>

          </Paper>
        ) : (
          <Paper className="no-print" sx={{ p: 3, width: "100%", maxWidth: "750px", textAlign: "center", border: isDarkMode ? "1px dashed #2e3b63" : "1px dashed #cbd5e1", backgroundColor: isDarkMode ? "#1c2541" : "background.paper" }}>
            <Typography variant="body2" sx={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}>
              No data found for the selected employee in {month} {year}.
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
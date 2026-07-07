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
  Divider,
  CircularProgress
} from "@mui/material";
import axios from "axios";
import { useTheme } from "@mui/material/styles"; 

// Icons
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";

interface EmployeeType {
  id: number;
  emp_code: string;
  full_name: string;
}

interface ProductType {
  id: number;
  product_name: string;
}

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" }, { value: 4, label: "April" },
  { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" },
  { value: 9, label: "September" }, { value: 10, label: "October" },
  { value: 11, label: "November" }, { value: 12, label: "December" },
];

const YEARS = ["2025", "2026", "2027", "2028"];

export default function DetailSheets() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark"; 

  const [employees, setEmployees] = useState<EmployeeType[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<number | "">("");
  const [year, setYear] = useState<string>(String(new Date().getFullYear()));
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

  const [empInfo, setEmpInfo] = useState<any>(null);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [sheetData, setSheetData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  
  const [loading, setLoading] = useState<boolean>(false);

  const fetchReportData = async (empId: number, selectedYear: string, selectedMonth: number) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/timecard/detail-sheet", {
        employee_id: empId,
        year: parseInt(selectedYear),
        month: selectedMonth
      });

      if (response.data.success) {
        setEmpInfo(response.data.employee);
        setProducts(response.data.products);
        setSheetData(response.data.sheet_data);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error("Error loading report:", error);
      alert("Failed to load report data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios.get("http://localhost:8000/api/timecard/employees")
      .then(res => {
        if (res.data.success && res.data.employees.length > 0) {
          setEmployees(res.data.employees); 

          const queryParams = new URLSearchParams(window.location.search);
          const urlEmpId = queryParams.get("employee_id");
          const urlYear = queryParams.get("year");
          const urlMonth = queryParams.get("month"); 

          let activeEmpId = res.data.employees[0].id; 
          let activeYear = String(new Date().getFullYear()); 
          let activeMonth = new Date().getMonth() + 1; 

          if (urlEmpId) {
            activeEmpId = Number(urlEmpId);
            setSelectedEmpId(activeEmpId); 
          } else {
            setSelectedEmpId(activeEmpId); 
          }

          if (urlYear) {
            activeYear = urlYear;
            setYear(activeYear); 
          }

          if (urlMonth) {
            const foundMonth = MONTHS.find(m => m.label.toLowerCase() === urlMonth.toLowerCase());
            if (foundMonth) {
              activeMonth = foundMonth.value; 
            } else if (!isNaN(Number(urlMonth))) {
              activeMonth = Number(urlMonth); 
            }
            setMonth(activeMonth); 
          }

          fetchReportData(activeEmpId, activeYear, activeMonth);
        }
      })
      .catch(err => console.error("Error loading employees:", err)); 
  }, []);

  const handleLoadReport = () => {
    if (!selectedEmpId) return;
    fetchReportData(Number(selectedEmpId), year, month);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentDateTime = new Date().toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const safeParseFloat = (val: any) => {
    if (val === undefined || val === null) return 0;
    const strVal = val.toString().replace(/,/g, '');
    return parseFloat(strVal) || 0;
  };

  const filterInputStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 1.5,
      backgroundColor: isDarkMode ? "#131a30" : "#ffffff",
      "& fieldset": { borderColor: isDarkMode ? "#2e3b63" : "#ced4da" },
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: isDarkMode ? "transparent" : "#f8f9fa", minHeight: "100vh" }}>      
      <style>
        {`
          .print-only-info {
            display: none !important;
          }

          @media print {
            @page {
              size: A4 landscape;
              margin: 6mm 6mm 6mm 6mm;
            }

            nav, aside, header, footer, .no-print, button, .admin-header-box, .filter-section-wrapper,
            [class*="sidebar"], [class*="Sidebar"],
            [class*="navbar"], [class*="Navbar"],
            [class*="MuiDrawer-root"], [class*="Header"],
            div[class*="Layout-sidebar"], div[class*="Layout-header"],
            div[class*="sidebar-wrapper"], div[class*="header-container"] {
              display: none !important;
              width: 0 !important;
              height: 0 !important;
              padding: 0 !important;
              margin: 0 !important;
              opacity: 0 !important;
            }

            html, body, #root, __next, main, 
            [class*="main-content"], [class*="content-wrapper"], [class*="MuiBox-root"], .printable-main-card {
              background: #fff !important;
              background-color: #fff !important;
              color: #000 !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              box-shadow: none !important;
              display: block !important;
            }

            .printable-main-card {
              border: none !important;
            }

            .screen-only-info {
              display: none !important;
            }

            .print-only-info {
              display: block !important;
              text-align: left !important;
              margin-top: 4px !important;
              margin-bottom: 8px !important;
            }

            .print-info-row {
              display: flex !important;
              align-items: center !important;
              margin-bottom: 2px !important;
            }

            .print-info-label {
              width: 100px !important;
              font-weight: bold !important;
              font-size: 11px !important;
              color: #000 !important;
            }

            .print-info-value {
              font-weight: bold !important;
              font-size: 11px !important;
              color: #000 !important;
            }

            .title-flex-block {
              display: flex !important;
              flex-direction: row !important;
              justify-content: space-between !important;
              align-items: center !important;
              width: 100% !important;
              margin-bottom: 2px !important;
            }

            .page-one-wrapper {
              display: block !important;
              width: 100% !important;
              page-break-after: auto !important;
            }

            .table-container-print {
              border: 1px solid #000 !important;
              margin-bottom: 2px !important; 
              page-break-inside: auto !important;
              background: #fff !important;
            }

            table {
              width: 100% !important;
              table-layout: auto !important;
              border-collapse: collapse !important;
              background: #fff !important;
            }

            th {
              background-color: #aacdfa !important;
              color: #024271 !important;
              font-weight: bold !important;
              font-size: 7.5px !important;
              border: 1px solid #000 !important;
              padding: 1px 0.5px !important; 
              text-align: center !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            tr, td {
              background: #fff !important;
              background-color: #fff !important;
              color: #000 !important;
              border: 1px solid #000 !important;
              padding: 0.8px 0.5px !important; 
              font-size: 7.5px !important; 
              text-align: center !important;
              white-space: nowrap !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            tr.holiday-print-row, tr.holiday-print-row td {
              background-color: #fff1f2 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            tr.total-print-row, tr.total-print-row td {
              background-color: #f8fafc !important;
              color: #024271 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .summary-section-container {
              page-break-before: always !important; 
              display: block !important;
              width: 100% !important;
              margin-top: 15px !important;
            }

            .MuiPaper-outlined {
              border: 1px solid #000 !important;
              background: transparent !important;
              padding: 6px !important;
              margin-top: 3px !important;
            }
            
            .MuiPaper-outlined * {
              color: #000 !important;
            }
          }
        `}
      </style>

      {/* Screen Header */}
      <Box sx={{ mb: 3 }} className="no-print admin-header-box">
        <Typography variant="h5" sx={{ color: isDarkMode ? "#90caf9" : "#1e293b", fontWeight: 700, fontSize: "1.5rem" }}>
          Detail Sheet
        </Typography>        
      </Box>

      {/* Filter Paper Controls */}
      <Paper className="no-print filter-section-wrapper" sx={{ p: 2.5, mb: 4, borderRadius: 2, boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)", border: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0", backgroundColor: isDarkMode ? "#1c2541" : "background.paper" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "#475569", display: "block", mb: 0.5 }}>Employee</Typography>
            <TextField select fullWidth size="small" value={selectedEmpId} onChange={(e) => setSelectedEmpId(Number(e.target.value))} sx={filterInputStyles}>
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.emp_code} - {emp.full_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "#475569", display: "block", mb: 0.5 }}>Year</Typography>
            <TextField select fullWidth size="small" value={year} onChange={(e) => setYear(e.target.value)} sx={filterInputStyles}>
              {YEARS.map((yr) => (
                <MenuItem key={yr} value={yr}>{yr}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "#475569", display: "block", mb: 0.5 }}>Month</Typography>
            <TextField select fullWidth size="small" value={month} onChange={(e) => setMonth(Number(e.target.value))} sx={filterInputStyles}>
              {MONTHS.map((m) => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: "flex", mt: 2.5, gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleLoadReport}
              disabled={loading || !selectedEmpId}
              sx={{ bgcolor: "#1976d2", "&:hover": { bgcolor: "#1565c0" }, textTransform: "none", px: 3, borderRadius: 1.5, fontWeight: 600 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "View Report"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<LocalPrintshopIcon />}
              onClick={handlePrint}
              disabled={!summary}
              sx={{ textTransform: "none", color: isDarkMode ? "#cbd5e1" : "#475569", borderColor: isDarkMode ? "#2e3b63" : "#cbd5e1", borderRadius: 1.5, fontWeight: 600, "&:hover": { borderColor: isDarkMode ? "#475569" : "#b0bec5" } }}
            >
              Print Sheet
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Printable Sheet Card */}
      {empInfo && summary && (
        <Paper className="printable-main-card" sx={{ p: 4, borderRadius: 2, boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)", border: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0", bgcolor: isDarkMode ? "#1c2541" : "#fff" }}>
          
          <div className="page-one-wrapper">
            <Box className="title-flex-block">
              <Typography variant="h6" sx={{ color: isDarkMode ? "#90caf9" : "#024271", fontWeight: 700 }}>
                Panda Consumer Products
              </Typography>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: isDarkMode ? "#cbd5e1" : "#1e293b", display: "block" }}>
                  {MONTHS.find(m => m.value === month)?.label} {year}
                </Typography>
                <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "#94a3b8" }}>Generated: {currentDateTime}</Typography>
              </Box>
            </Box>
            
            <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "#64748b", fontWeight: 600, display: "block", mb: 1 }}>
              Monthly Salary / Time Card Detail
            </Typography>

            {/* Screen Info Row */}
            <Box className="screen-only-info" sx={{ p: 1.5, borderRadius: 1.5, mb: 3, border: isDarkMode ? "1px solid #2e3b63" : "1px solid #bfdbfe", bgcolor: isDarkMode ? "#131a30" : "#eff6ff" }}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}><Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "#64748b", display: "block" }}>Name</Typography><Typography variant="body2" sx={{ fontWeight: 700, color: isDarkMode ? "#cbd5e1" : "#1e293b" }}>{empInfo.name}</Typography></Grid>
                <Grid item xs={6} sm={3}><Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "#64748b", display: "block" }}>Code</Typography><Typography variant="body2" sx={{ fontWeight: 700, color: "#90caf9" }}>{empInfo.code}</Typography></Grid>
                <Grid item xs={6} sm={3}><Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "#64748b", display: "block" }}>Department</Typography><Typography variant="body2" sx={{ fontWeight: 700, color: isDarkMode ? "#cbd5e1" : "#1e293b" }}>{empInfo.dept}</Typography></Grid>
                <Grid item xs={6} sm={3}><Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "#64748b", display: "block" }}>NIC</Typography><Typography variant="body2" sx={{ fontWeight: 700, color: isDarkMode ? "#cbd5e1" : "#1e293b" }}>{empInfo.nic}</Typography></Grid>
              </Grid>
            </Box>

            {/* Print Only Rows */}
            <div className="print-only-info">
              <div className="print-info-row"><span className="print-info-label">Name</span><span className="print-info-value">: {empInfo.name}</span></div>
              <div className="print-info-row"><span className="print-info-label">Code</span><span className="print-info-value">: {empInfo.code}</span></div>
              <div className="print-info-row"><span className="print-info-label">Department</span><span className="print-info-value">: {empInfo.dept}</span></div>
              <div className="print-info-row"><span className="print-info-label">NIC</span><span className="print-info-value">: {empInfo.nic}</span></div>
            </div>

            {/* Table Area */}
            <TableContainer className="table-container-print" sx={{ border: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0", borderRadius: 1.5, mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ "& th": { bgcolor: isDarkMode ? "#131a30" : "#aacdfa", color: isDarkMode ? "#90caf9" : "#024271", fontWeight: 700, fontSize: "0.72rem", textAlign: "center", py: 0.8, borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit" } }}>
                    <TableCell align="left">DATE</TableCell>
                    <TableCell>DAY</TableCell>
                    <TableCell>STATUS</TableCell>
                    <TableCell>SHIFT</TableCell>
                    {products.map((prod) => (
                      <TableCell key={prod.id}>{prod.product_name.toUpperCase()}</TableCell>
                    ))}
                    <TableCell>PROD. PAY</TableCell>
                    <TableCell>OT</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sheetData.map((row, idx) => {
                    const isHolidayRow = row.day === "Sun" || row.status === "Holiday";
                    return (
                      <TableRow 
                        key={idx} 
                        className={isHolidayRow ? "holiday-print-row" : ""}
                        sx={{ bgcolor: isHolidayRow ? (isDarkMode ? "#2d1f29" : "#fff1f2") : "inherit" }}
                      >
                        <TableCell align="left" sx={{ fontSize: "0.75rem", fontWeight: 500, color: isDarkMode ? "#cbd5e1" : "inherit", borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit" }}>{row.date}</TableCell>
                        <TableCell align="center" sx={{ fontSize: "0.75rem", color: row.day === "Sun" ? "#e11d48" : (isDarkMode ? "#cbd5e1" : "inherit"), fontWeight: row.day === "Sun" ? 600 : 400, borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit" }}>{row.day}</TableCell>
                        <TableCell align="center" sx={{ fontSize: "0.75rem", color: row.status === "Leave" ? "#e11d48" : (isDarkMode ? "#cbd5e1" : "inherit"), borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit" }}>{row.status}</TableCell>
                        <TableCell align="center" sx={{ fontSize: "0.75rem", color: isDarkMode ? "#94a3b8" : "#64748b", borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit" }}>-</TableCell>
                        {products.map((prod) => (
                          <TableCell key={prod.id} align="center" sx={{ fontSize: "0.75rem", fontWeight: 500, color: isDarkMode ? "#cbd5e1" : "inherit", borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit" }}>
                            {row.quantities[prod.id] !== undefined && row.quantities[prod.id] > 0 ? row.quantities[prod.id] : "-"}
                          </TableCell>
                        ))}
                        <TableCell align="right" sx={{ fontSize: "0.75rem", fontWeight: 600, pr: 2, color: isDarkMode ? "#cbd5e1" : "inherit", borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit" }}>{row.production_pay}</TableCell>
                        <TableCell align="center" sx={{ fontSize: "0.75rem", color: isDarkMode ? "#cbd5e1" : "inherit", borderBottom: isDarkMode ? "1px solid #2e3b63" : "inherit" }}>{row.ot_hours}</TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {/* Total Row */}
                  <TableRow 
                    className="total-print-row"
                    sx={{ bgcolor: isDarkMode ? "#131a30" : "#f8fafc", "& td": { fontWeight: 700, color: isDarkMode ? "#90caf9" : "#024271", borderTop: isDarkMode ? "2px solid #2e3b63" : "2px solid #aacdfa", fontSize: "0.75rem", borderBottom: "none" } }}
                  >
                    <TableCell colSpan={4}>Grand Total – {summary.days_worked} day(s) worked</TableCell>
                    {products.map((prod) => {
                      const totalQty = sheetData.reduce((sum, row) => sum + (row.quantities[prod.id] || 0), 0);
                      return <TableCell key={prod.id} align="center">{totalQty > 0 ? totalQty : "-"}</TableCell>;
                    })}
                    <TableCell align="right" sx={{ pr: 2 }}>Rs. {summary.total_production}</TableCell>
                    <TableCell align="center">{summary.total_ot !== "0.00" && summary.total_ot !== "-" ? `Rs. ${summary.total_ot}` : "-"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Summaries Block */}
          <Box className="summary-section-container">
            <Grid container spacing={3} sx={{ mb: 5 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "#475569", fontWeight: 700, letterSpacing: 0.5, display: "block", mb: 1 }}>
                  EARNINGS SUMMARY
                </Typography>
                <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, borderColor: isDarkMode ? "#2e3b63" : "#e2e8f0", bgcolor: isDarkMode ? "#131a30" : "transparent" }}>
                  {[
                    { label: "Production Allowance", value: summary.total_production },
                    { label: "OT Earnings", value: summary.ot_earnings },
                    { label: "Day Duty Allowances", value: summary.total_day_duty, condition: safeParseFloat(summary.total_day_duty) > 0 },
                    { label: "Travelling Allowances", value: summary.total_travelling, condition: safeParseFloat(summary.total_travelling) > 0 },
                    { label: "Other Allowances", value: summary.total_other, condition: safeParseFloat(summary.total_other) > 0 }
                  ].map((item, index) => (
                    (item.condition === undefined || item.condition) && (
                      <Box key={index} sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 2, mb: 1.5, alignItems: "center" }}>
                        <Typography variant="body2" sx={{ color: isDarkMode ? "#94a3b8" : "#64748b", textAlign: "left" }}>{item.label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right", color: isDarkMode ? "#cbd5e1" : "inherit" }}>Rs. {item.value}</Typography>
                      </Box>
                    )
                  ))}

                  <Divider sx={{ my: 1, borderColor: isDarkMode ? "#2e3b63" : "divider" }} />
                  
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 2, pt: 0.5, alignItems: "center" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: isDarkMode ? "#90caf9" : "#024271", textAlign: "left" }}>GROSS PAY</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: isDarkMode ? "#81c784" : "#2e7d32", textAlign: "right" }}>Rs. {summary.gross_pay}</Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "#475569", fontWeight: 700, letterSpacing: 0.5, display: "block", mb: 1 }}>
                  ATTENDANCE SUMMARY
                </Typography>
                <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, borderColor: isDarkMode ? "#2e3b63" : "#e2e8f0", bgcolor: isDarkMode ? "#131a30" : "transparent" }}>
                  <Grid container spacing={2} sx={{ textAlign: "center" }}>
                    <Grid item xs={4}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#1976d2" }}>{summary.days_worked}</Typography>
                      <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}>Days Worked</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#e11d48" }}>{summary.days_leave}</Typography>
                      <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}>Days Leave</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: isDarkMode ? "#cbd5e1" : "#475569" }}>{summary.days_off}</Typography>
                      <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}>Off / Holiday</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>

            {/* Bottom Signature Blocks */}
            <Grid container spacing={4} sx={{ pt: 3 }}>
              <Grid item xs={4} sx={{ textAlign: "center" }}>
                <Box sx={{ borderTop: isDarkMode ? "1px solid #2e3b63" : "1px solid #cbd5e1", pt: 1 }}>
                  <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "#475569", fontWeight: 600 }}>Employee Signature</Typography>
                </Box>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: "center" }}>
                <Box sx={{ borderTop: isDarkMode ? "1px solid #2e3b63" : "1px solid #cbd5e1", pt: 1 }}>
                  <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "#475569", fontWeight: 600 }}>Prepared By</Typography>
                </Box>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: "center" }}>
                <Box sx={{ borderTop: isDarkMode ? "1px solid #2e3b63" : "1px solid #cbd5e1", pt: 1 }}>
                  <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "#475569", fontWeight: 600 }}>Authorised Signature</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

        </Paper>
      )}
    </Box>
  );
}
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
  Card,
  CardContent,
  CircularProgress
} from "@mui/material";
import axios from "axios";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom"; 
import { useTheme } from "@mui/material/styles"; 

// Icons
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import GridOnIcon from "@mui/icons-material/GridOn";
import EditIcon from "@mui/icons-material/Edit";
import useCurrentUser from "../../hooks/useCurrentUser";
import { PermissionKeys } from "../Administration/SectionList";

const API_BASE_URL = "http://localhost:8000/api";

// Month names in order, used to work out the current month's label
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function MonthlySummary() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const { user } = useCurrentUser();
  const userPermissionObject = user?.permissionObject;
  const canViewPaySlips = userPermissionObject?.[PermissionKeys.PAYROLL_PAY_SLIPS_VIEW];
  const canViewDetailSheets = userPermissionObject?.[PermissionKeys.PAYROLL_DETAIL_SHEETS_VIEW];
  const canViewTimeCards = userPermissionObject?.[PermissionKeys.PAYROLL_TIME_CARDS_VIEW];

  // Default to the current real-world year/month, so the page opens
  // already pointed at "this month" instead of a hardcoded date.
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(MONTH_NAMES[new Date().getMonth()]);

  const [summaryData, setSummaryData] = useState<any[]>([]);
  const [totals, setTotals] = useState<any>({ 
    days: 0, leaves: 0, prod_pay: 0, ot: 0, day_duty: 0, travel: 0, other: 0, total_allowances: 0, gross: 0 
  });
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false); 

  const handleLoad = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/payroll/summary?year=${year}&month=${month}`);
      if (response.data.success || response.data.data) {
        setSummaryData(response.data.data); 
        setTotals(response.data.totals);   
      }
    } catch (error) {
      console.error("Error loading summary:", error);
      alert("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-load the current month's summary as soon as the page opens,
  // instead of requiring the user to manually click "Load" first.
  useEffect(() => {
    handleLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoToPaySlip = (employeeId: number) => {
    if (!employeeId) return;
    window.open(`/payroll/slips?employee_id=${employeeId}&year=${year}&month=${month}`, '_blank');
  };

  const handleGoToDetailSheet = (employeeId: number) => {
    if (!employeeId) return;
    window.open(`/payroll/detail-sheets?employee_id=${employeeId}&year=${year}&month=${month}`, '_blank');
  };

  const handleEditTimecard = (employeeId: number) => {
    if (!employeeId) return;
    navigate(`/payroll/time-cards?employee_id=${employeeId}&year=${year}&month=${month}`);
  };

  const handleExportAllDetailSheets = async () => {
    if (summaryData.length === 0) {
      alert("No employee data available. Please load the summary first.");
      return;
    }

    setExporting(true);
    try {
      const prodRes = await axios.get(`${API_BASE_URL}/timecard/products`);
      const activeProducts = prodRes.data.success ? prodRes.data.products : [];

      const monthMap: { [key: string]: number } = {
        January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
        July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
      };
      const monthNumber = monthMap[month] || (new Date().getMonth() + 1);

      const workbook = XLSX.utils.book_new();

      const fetchPromises = summaryData.map(async (row) => {
        const empId = row.employee?.id;
        const empCode = row.employee?.emp_code || "N/A";
        const empName = row.employee?.full_name || "N/A";

        if (!empId) return null;

        try {
          const res = await axios.post(`${API_BASE_URL}/timecard/detail-sheet`, {
            employee_id: empId,
            year: parseInt(year),
            month: monthNumber
          });
          return { resData: res.data, empCode, empName };
        } catch (err) {
          console.error(`Failed to fetch sheet for ${empName}`, err);
          return null;
        }
      });

      const fetchedSheets = await Promise.all(fetchPromises);

      for (const item of fetchedSheets) {
        if (!item || !item.resData || !item.resData.sheet_data) continue;

        const { resData, empCode, empName } = item;
        const empDetails = resData.employee;
        const dailyRecords = resData.sheet_data;
        const summaryTotals = resData.summary;

        const sheetRows: any[][] = [];

        sheetRows.push(["PANDA CONSUMER PRODUCTS - MONTHLY DETAIL SHEET"]);
        sheetRows.push(["Month/Year:", `${month} ${year}`]);
        sheetRows.push(["Employee Code:", empDetails.code, "Employee Name:", empDetails.name]);
        sheetRows.push(["Department:", empDetails.dept, "NIC No:", empDetails.nic || "N/A"]);
        sheetRows.push([]); 

        let tableHeaders = ["Date", "Day", "Status"];
        activeProducts.forEach((p: any) => {
          tableHeaders.push(p.product_name.toUpperCase());
        });
        tableHeaders.push("Prod. Pay", "OT Hours", "Day Duty", "Travel", "Other", "Gross Pay");
        sheetRows.push(tableHeaders);

        dailyRecords.forEach((day: any) => {
          let csvRow: any[] = [day.date, day.day, day.status];

          activeProducts.forEach((p: any) => {
            const qty = day.quantities && day.quantities[p.id] !== undefined ? day.quantities[p.id] : "-";
            csvRow.push(qty === "-" ? "-" : Number(qty)); 
          });

          const prodPayNum = parseFloat((day.production_pay || "0").replace(/,/g, "")) || 0;
          const otHoursNum = parseFloat((day.ot_hours || "0").replace(/,/g, "")) || 0;
          const dayDutyNum = parseFloat((day.day_duty || "0").replace(/,/g, "")) || 0;
          const travelNum  = parseFloat((day.travelling || "0").replace(/,/g, "")) || 0;
          const otherNum   = parseFloat((day.other || "0").replace(/,/g, "")) || 0;
          const dailyGross = prodPayNum + otHoursNum + dayDutyNum + travelNum + otherNum;

          csvRow.push(
            day.production_pay,
            day.ot_hours,
            day.day_duty,
            day.travelling,
            day.other,
            dailyGross.toFixed(2)
          );

          sheetRows.push(csvRow);
        });

        let totalRow: any[] = [`Grand Total (${summaryTotals.days_worked} Days Worked)`, "", ""];
        
        activeProducts.forEach((p: any) => {
          const totalQty = dailyRecords.reduce((sum: number, r: any) => sum + (parseInt(r.quantities[p.id]) || 0), 0);
          totalRow.push(totalQty > 0 ? totalQty : "-");
        });

        totalRow.push(
          summaryTotals.total_production,
          summaryTotals.total_ot,
          summaryTotals.total_day_duty,
          summaryTotals.total_travelling,
          summaryTotals.total_other,
          summaryTotals.gross_pay
        );
        sheetRows.push(totalRow);

        const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
        let sheetName = `${empCode}_${empName}`.replace(/[/\\?*:[\]]/g, "").slice(0, 31);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }

      XLSX.writeFile(workbook, `All_Detail_Sheets_${month}_${year}.xlsx`);

    } catch (error) {
      console.error("Error exporting excel detail sheets:", error);
      alert("Failed to export Excel sheets.");
    } finally {
      setExporting(false);
    }
  };

  const summaryMetrics = [
    { title: "TOTAL PAYROLL", value: `Rs. ${parseFloat(totals.gross || 0).toFixed(2)}`, color: isDarkMode ? "#90caf9" : "#1976d2" },
    { title: "TOTAL PRODUCTION PAY", value: `Rs. ${parseFloat(totals.prod_pay || 0).toFixed(2)}`, color: isDarkMode ? "#81c784" : "#2e7d32" },
    { title: "TOTAL ALLOWANCES", value: `Rs. ${parseFloat(totals.total_allowances || 0).toFixed(2)}`, color: isDarkMode ? "#ffb74d" : "#e65100" },
    { title: "WORKING DAYS (TOTAL)", value: (totals.days || 0).toString(), color: isDarkMode ? "#cbd5e1" : "#2c3e50" },
  ];

  const filterInputStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: isDarkMode ? "#131a30" : "#ffffff",
      "& fieldset": { borderColor: isDarkMode ? "#2e3b63" : "#ced4da" },
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* Page Title */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ color: isDarkMode ? "#90caf9" : "#024271", fontWeight: 600 }}>
          Monthly Payroll Summary
        </Typography>
        <Typography variant="body2" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", fontWeight: 500 }}>
          {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Typography>
      </Box>

      {/* Top Filter Card */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 1, backgroundColor: isDarkMode ? "#1c2541" : "background.paper", border: isDarkMode ? "1px solid #2e3b63" : "none" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 0.5 }}>Year</Typography>
            <TextField select fullWidth size="small" value={year} onChange={(e) => setYear(e.target.value)} sx={filterInputStyles}>
              <MenuItem value="2025">2025</MenuItem>
              <MenuItem value="2026">2026</MenuItem>
              <MenuItem value="2027">2027</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 0.5 }}>Month</Typography>
            <TextField select fullWidth size="small" value={month} onChange={(e) => setMonth(e.target.value)} sx={filterInputStyles}>
              {MONTH_NAMES.map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: "flex", gap: 1, mt: 2.5 }}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
              onClick={handleLoad}
              disabled={loading || exporting}
              sx={{ bgcolor: "#1976d2", "&:hover": { bgcolor: "#1565c0" }, textTransform: "none", px: 3 }}
            >
              {loading ? "Loading..." : "Load"}
            </Button>
            {/* "Recompute All" button removed — Time Card saves now trigger
                the official recompute automatically (see TimecardController),
                so this manual button is no longer needed for normal use. */}
          </Grid>
        </Grid>
      </Paper>

      {/*Summary Cards Grid */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {summaryMetrics.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ boxShadow: 1, borderRadius: 2, bgcolor: isDarkMode ? "#1e293b" : "#fff", height: "100%", border: isDarkMode ? "1px solid #2e3b63" : "none" }}>
              <CardContent sx={{ p: "16px !important" }}>
                <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", fontWeight: 700, letterSpacing: 0.5 }}>
                  {card.title}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: card.color }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Table Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: isDarkMode ? "#90caf9" : "#2c3e50" }}>
          {month} {year} – All Employees
        </Typography>
        {canViewDetailSheets && (
        <Button
          variant="outlined"
          size="small"
          startIcon={exporting ? <CircularProgress size={14} color="inherit" /> : <FileDownloadIcon />}
          onClick={handleExportAllDetailSheets}
          disabled={loading || exporting}
          sx={{ textTransform: "none", color: isDarkMode ? "#94a3b8" : "text.secondary", borderColor: isDarkMode ? "#2e3b63" : "#ced4da", "&:hover": { borderColor: isDarkMode ? "#475569" : "#b0bec5" } }}
        >
          {exporting ? "Exporting Daily Sheets..." : "Export All Detail Sheets"}
        </Button>
      )}
      </Box>

      {/* Main Payroll Summary Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1, position: "relative", backgroundColor: isDarkMode ? "#1c2541" : "background.paper", border: isDarkMode ? "1px solid #2e3b63" : "none" }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", position: "absolute", top: 0, left: 0, width: "100%", height: "100%", bgcolor: isDarkMode ? "rgba(28,37,65,0.8)" : "rgba(255,255,255,0.7)", zIndex: 2 }}>
            <CircularProgress />
          </Box>
        )}
        <Table size="medium">
          <TableHead>
            <TableRow 
              sx={{ 
                "& th": { 
                  bgcolor: isDarkMode ? "#131a30" : "#aacdfa", 
                  fontWeight: 700, 
                  color: isDarkMode ? "#90caf9" : "#024271", 
                  fontSize: "0.75rem",
                  borderBottom: isDarkMode ? "1px solid #2e3b63" : "1px solid #93c5fd"
                } 
              }}
            >
              <TableCell>EMPLOYEE</TableCell>
              <TableCell>DEPT</TableCell>
              <TableCell align="center">DAYS</TableCell>
              <TableCell align="center">LEAVES</TableCell>
              <TableCell align="right">PROD. PAY</TableCell>
              <TableCell align="center">OT</TableCell>
              <TableCell align="center">DAY DUTY</TableCell>
              <TableCell align="center">TRAVEL</TableCell>
              <TableCell align="center">OTHER</TableCell>
              <TableCell align="right">GROSS PAY</TableCell>
              <TableCell align="center">STATUS</TableCell>
              <TableCell align="center">ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {summaryData.length > 0 ? (
              summaryData.map((row: any, idx: number) => (
                <TableRow key={idx} hover sx={{ "&:hover": { bgcolor: isDarkMode ? "rgba(255,255,255,0.02)" : "#f8fafc" }, "& td": { borderBottom: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0" } }}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 30, height: 30, fontSize: "0.8rem", bgcolor: isDarkMode ? "#2e3b63" : "#e0f2f1", color: isDarkMode ? "#90caf9" : "#00796b" }}>
                        {row.employee?.full_name ? row.employee.full_name.charAt(0) : "E"}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: isDarkMode ? "#cbd5e1" : "#2c3e50", fontSize: "0.82rem" }}>
                          {row.employee?.full_name || "N/A"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", fontWeight: 500 }}>
                          {row.employee?.emp_code || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8rem", color: isDarkMode ? "#94a3b8" : "text.secondary" }}>
                    {row.employee?.department?.name || "N/A"}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.8rem", color: isDarkMode ? "#cbd5e1" : "text.primary" }}>{row.days_worked}</TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.8rem", color: isDarkMode ? "#cbd5e1" : "text.primary" }}>{row.days_leave}</TableCell>
                  <TableCell align="right" sx={{ fontSize: "0.8rem", color: isDarkMode ? "#cbd5e1" : "text.primary" }}>Rs. {parseFloat(row.total_production || 0).toFixed(2)}</TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.8rem", color: isDarkMode ? "#94a3b8" : "text.secondary" }}>{row.total_ot}</TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.8rem", color: isDarkMode ? "#94a3b8" : "text.secondary" }}>Rs. {parseFloat(row.total_day_duty || 0).toFixed(2)}</TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.8rem", color: isDarkMode ? "#94a3b8" : "text.secondary" }}>Rs. {parseFloat(row.total_travelling || 0).toFixed(2)}</TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.8rem", color: isDarkMode ? "#94a3b8" : "text.secondary" }}>Rs. {parseFloat(row.total_other || 0).toFixed(2)}</TableCell>
                  
                  <TableCell align="right" sx={{ fontWeight: 700, color: isDarkMode ? "#64b5f6" : "#1976d2", fontSize: "0.82rem" }}>
                    Rs. {parseFloat(row.gross_pay || 0).toFixed(2)}
                  </TableCell>
                  
                  <TableCell align="center">
                    <Chip 
                      label={row.is_locked ? "Locked" : "Open"} 
                      size="small" 
                      sx={{ 
                        bgcolor: row.is_locked ? (isDarkMode ? "#7f1d1d" : "#ffebee") : (isDarkMode ? "#064e3b" : "#e8f5e9"), 
                        color: row.is_locked ? (isDarkMode ? "#fca5a5" : "#c62828") : (isDarkMode ? "#6ee7b7" : "#2e7d32"), 
                        fontWeight: 600, borderRadius: 1, height: 20, fontSize: "0.7rem" 
                      }} 
                    />
                  </TableCell>
                  <TableCell align="center">
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                        {canViewPaySlips && (
                          <IconButton size="small" onClick={() => handleGoToPaySlip(row.employee?.id)} title="View Pay Slip">
                            <ReceiptLongIcon fontSize="small" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary" }} />
                          </IconButton>
                        )}
                        {canViewDetailSheets && (
                          <IconButton size="small" onClick={() => handleGoToDetailSheet(row.employee?.id)} title="View Detail Sheet">
                            <GridOnIcon fontSize="small" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary" }} />
                          </IconButton>
                        )}
                        {canViewTimeCards && (
                          <IconButton size="small" onClick={() => handleEditTimecard(row.employee?.id)} title="Edit Timecards">
                            <EditIcon fontSize="small" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary" }} />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 3, color: isDarkMode ? "#94a3b8" : "text.secondary" }}>
                  {loading ? "Loading..." : "No data found for this month yet."}
                </TableCell>
              </TableRow>
            )}

            {/* Bottom Dynamic Total Row */}
            {summaryData.length > 0 && (
              <TableRow sx={{ bgcolor: isDarkMode ? "#131a30" : "#f8f9fa", "& td": { fontWeight: 700, color: isDarkMode ? "#90caf9" : "#024271", borderTop: isDarkMode ? "2px solid #2e3b63" : "2px solid #aacdfa" } }}>
                <TableCell colSpan={2}>Totals</TableCell>
                <TableCell align="center">{totals.days}</TableCell>
                <TableCell align="center">{totals.leaves}</TableCell>
                <TableCell align="right">Rs. {parseFloat(totals.prod_pay || 0).toFixed(2)}</TableCell>
                <TableCell align="center">{totals.ot}</TableCell>
                <TableCell align="center">Rs. {parseFloat(totals.day_duty || 0).toFixed(2)}</TableCell>
                <TableCell align="center">Rs. {parseFloat(totals.travel || 0).toFixed(2)}</TableCell>
                <TableCell align="center">Rs. {parseFloat(totals.other || 0).toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ color: isDarkMode ? "#81c784 !important" : "#1976d2 !important" }}>Rs. {parseFloat(totals.gross || 0).toFixed(2)}</TableCell>
                <TableCell align="center">-</TableCell>
                <TableCell align="center">-</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
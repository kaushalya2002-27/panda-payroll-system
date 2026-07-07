import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Grid, Paper, TextField, MenuItem, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, InputBase,
} from "@mui/material";
import axios from "axios";
import { useTheme } from "@mui/material/styles"; 
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaymentsIcon from "@mui/icons-material/Payments";
import SaveIcon from "@mui/icons-material/Save";

const API = "http://localhost:8000/api";

interface EmployeeType { id: number; emp_code: string; full_name: string; }
interface ProductType { id: number; product_name: string; target_weekday: number; target_saturday: number; rate_below: number; rate_above: number; }
interface TimecardRow {
  date: string; day: string; status: string; start_time: string; end_time: string;
  hours: string; ot_hours: string; day_duty: string; travelling: string;
  other_allowance: string; gross_pay: string; notes: string;
  product_quantities: { [productId: number]: number };
}

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" }, { value: 4, label: "April" },
  { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" },
  { value: 9, label: "September" }, { value: 10, label: "October" },
  { value: 11, label: "November" }, { value: 12, label: "December" },
];
const YEARS = ["2023", "2024", "2025", "2026", "2027"];

const getRowBgColor = (day: string, isDarkMode: boolean) => {
  if (!day) return isDarkMode ? "#1c2541" : "#ffffff";
  const d = day.toString().toLowerCase().trim();
  if (d === "sun" || d === "sunday") return isDarkMode ? "#3e1f25" : "#ffebee"; 
  if (d === "sat" || d === "saturday") return isDarkMode ? "#1e2d4a" : "#e3f2fd"; 
  return isDarkMode ? "#1c2541" : "#ffffff"; 
};

const mapRow = (row: any): TimecardRow => ({
  date: row.date,
  day: row.day,
  status: row.status || "work",
  start_time: row.start_time || "08.00",
  end_time: row.end_time || "14.00",
  hours: String(row.hours || "6.0"),
  ot_hours: String(row.ot_hours || "0.00"),
  day_duty: String(row.day_duty || "0.00"),
  travelling: String(row.travelling || "0.00"),
  other_allowance: String(row.other_allowance ?? row.other ?? "0.00"),
  gross_pay: String(row.gross_pay || "-"),
  notes: row.notes || "",
  product_quantities: row.product_quantities || {},
});

export default function TimeCards() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark"; 

  const [employees, setEmployees] = useState<EmployeeType[]>([]);
  const [products, setProducts]   = useState<ProductType[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | "">("");
  const [year, setYear]   = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [globalShift, setGlobalShift] = useState("8-2");
  const [daysData, setDaysData] = useState<TimecardRow[]>([]);
  const [loading, setLoading] = useState(false);

  const calcProductionPayRow = useCallback((row: TimecardRow, prods: ProductType[]): number => {
    const status = row.status ? row.status.toLowerCase().trim() : "work";
    
    if (status === "leave" || status === "off") return 0;
    
    const dow = new Date(row.date).getDay(); 
    if (dow === 0 && status !== "holiday") return 0;

    let totalQty = 0;
    let topProductId: number | null = null;
    let maxQty = -1;

    Object.entries(row.product_quantities).forEach(([id, qty]) => {
      const q = parseInt(qty as any) || 0;
      if (q > 0) {
        totalQty += q;
        if (q > maxQty) {
          maxQty = q;
          topProductId = parseInt(id);
        }
      }
    });

    if (totalQty === 0 || topProductId === null) return 0;

    const topProduct = prods.find(x => x.id === topProductId);
    if (!topProduct) return 0;

    if (status === "holiday") {
      return totalQty * topProduct.rate_above;
    }

    const target = dow === 6 ? topProduct.target_saturday : topProduct.target_weekday;
    const below = Math.min(totalQty, target);
    const above = Math.max(0, totalQty - target);

    return (below * topProduct.rate_below) + (above * topProduct.rate_above);
  }, []);

  const calcGross = useCallback((row: TimecardRow, prods: ProductType[]): string => {
    const prodPay = calcProductionPayRow(row, prods);

    const total = prodPay
      + (parseFloat(row.ot_hours) || 0)
      + (parseFloat(row.day_duty) || 0)
      + (parseFloat(row.travelling) || 0)
      + (parseFloat(row.other_allowance) || 0);
    return total > 0 ? total.toFixed(2) : "-";
  }, [calcProductionPayRow]);

  const loadTimecard = useCallback(async (empId: number, y: string, m: number) => {
    if (!empId) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/timecard/load`, {
        employee_id: empId,
        year: parseInt(y),
        month: m,
      });
      
      if (res.data.success && res.data.sheet_data) {
        setDaysData(res.data.sheet_data.map(mapRow));
      } else {
        setDaysData([]);
      }
    } catch (e) {
      console.error("load error", e);
      alert("Failed to load timecard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [empRes, prodRes] = await Promise.all([
          axios.get(`${API}/timecard/employees`),
          axios.get(`${API}/timecard/products`),
        ]);
        if (cancelled) return;

        if (prodRes.data.success) {
          setProducts(prodRes.data.products);
        }

        if (empRes.data.success && empRes.data.employees.length > 0) {
          setEmployees(empRes.data.employees);

          const queryParams = new URLSearchParams(window.location.search);
          const urlEmpId = queryParams.get("emp") || queryParams.get("employee_id"); 
          const urlYear = queryParams.get("year");
          const urlMonth = queryParams.get("month");

          let activeEmpId = empRes.data.employees[0].id;
          let activeYear = String(new Date().getFullYear());
          let activeMonth = new Date().getMonth() + 1;

          if (urlEmpId) {
            activeEmpId = Number(urlEmpId);
          }
          setSelectedEmployee(activeEmpId);

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

          await loadTimecard(activeEmpId, activeYear, activeMonth);
        }
      } catch (e) {
        console.error("init error", e);
      }
    })();
    return () => { cancelled = true; };
  }, [loadTimecard]);

  const handleEmployeeChange = async (empId: number | "") => {
    if (!empId) return;
    setSelectedEmployee(empId);
    await loadTimecard(empId, year, month);
  };

  const handleLoadButton = () => {
    if (selectedEmployee) loadTimecard(selectedEmployee as number, year, month);
  };
    
  const handleSave = async () => {
    if (!selectedEmployee) { alert("Please select an employee."); return; }
    try {
      const formattedDays = daysData.map(row => {
        const rowCopy = { ...row };
        const calculatedProdPay = calcProductionPayRow(row, products);
        const calculatedGross = calcGross(row, products);
        
        delete (rowCopy as any).hours;
        delete (rowCopy as any).other_allowance;

        const isLeave = row.status === "leave";

        const cleanProductQuantities: { [productId: number]: number } = {};
        products.forEach(prod => {
          const qty = isLeave ? 0 : row.product_quantities[prod.id];
          cleanProductQuantities[prod.id] = (qty === undefined || qty === null || String(qty).trim() === "") ? 0 : Number(qty);
        });

        return {
          ...rowCopy,
          product_quantities: cleanProductQuantities,
          production_pay: isLeave ? 0 : calculatedProdPay,
          other: isLeave ? 0 : (row.other_allowance === "" ? 0 : (parseFloat(row.other_allowance) || 0)), 
          ot_hours: isLeave ? 0 : (row.ot_hours === "" ? 0 : (parseFloat(row.ot_hours) || 0)),
          day_duty: isLeave ? 0 : (row.day_duty === "" ? 0 : (parseFloat(row.day_duty) || 0)),
          travelling: isLeave ? 0 : (row.travelling === "" ? 0 : (parseFloat(row.travelling) || 0)),
          gross_pay: isLeave ? 0 : (calculatedGross === "-" ? 0 : parseFloat(calculatedGross) || 0),
          start_time: isLeave ? "" : row.start_time,
          end_time: isLeave ? "" : row.end_time,
          notes: row.notes || ""
        };
      });

      const res = await axios.post(`${API}/timecard/save`, {
        employee_id: selectedEmployee,
        year: parseInt(year),
        month,
        days: formattedDays,
      });

      if (res.data.success) {
        alert("Timecard saved successfully!");
        loadTimecard(selectedEmployee as number, year, month); 
      } else {
        alert("Failed: " + (res.data.message || "Unknown backend error"));
      }
    } catch (e: any) {
      console.error("Save error:", e.response?.data || e.message);
      alert("Failed to save timecard. Please check backend compatibility.");
    }
  };

  const handleShiftChange = (schedule: string) => {
    setGlobalShift(schedule);
    const times: Record<string, [string, string, string]> = {
      "8-2":   ["08.00", "14.00", "6.0"],
      "2-10":  ["14.00", "22.00", "8.0"],
      "Custom":["",      "",      "0.0"],
    };
    const [s, e, h] = times[schedule] ?? ["08.00", "14.00", "6.0"];
    setDaysData(prev => prev.map(row => ({
      ...row,
      start_time: row.status === "work" ? s : row.start_time,
      end_time:   row.status === "work" ? e : row.end_time,
      hours:      row.status === "work" ? h : row.hours,
    })));
  };

  const handleRowChange = (idx: number, field: keyof TimecardRow, value: any) => {
    setDaysData(prev => {
      const rows = [...prev];
      let updatedRow = { ...rows[idx], [field]: value };

      if (field === "status" && value === "leave") {
        const resetQuantities = { ...updatedRow.product_quantities };
        Object.keys(resetQuantities).forEach(id => {
          resetQuantities[Number(id)] = 0;
        });

        updatedRow = {
          ...updatedRow,
          start_time: "",
          end_time: "",
          hours: "0.0",
          ot_hours: "0.00",
          day_duty: "0.00",
          travelling: "0.00",
          other_allowance: "0.00",
          product_quantities: resetQuantities
        };
      }

      rows[idx] = updatedRow;
      return rows;
    });
  };

  const handleQtyChange = (idx: number, productId: number, qty: string) => {
    setDaysData(prev => {
      const rows = [...prev];
      if (rows[idx].status === "leave") return prev;

      const parsedQty = qty === "" ? 0 : parseInt(qty) || 0;
      rows[idx] = {
        ...rows[idx],
        product_quantities: { ...rows[idx].product_quantities, [productId]: parsedQty },
      };
      return rows;
    });
  };

  const filterInputStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: isDarkMode ? "#131a30" : "#ffffff",
      "& fieldset": { borderColor: isDarkMode ? "#2e3b63" : "#cbd5e1" },
    }
  };

  const tableInputStyles = (disabled: boolean) => ({
    border: isDarkMode ? "1px solid #2e3b63" : "1px solid #b0bec5",
    borderRadius: 1,
    px: 0.5,
    fontSize: "0.85rem",
    fontWeight: 600,
    width: "100%",
    height: 32,
    color: isDarkMode ? "#cbd5e1" : "text.primary",
    bgcolor: disabled 
      ? (isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)") 
      : (isDarkMode ? "#131a30" : "transparent"),
    input: { textAlign: "center" }
  });

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ color: isDarkMode ? "#90caf9" : "#024271", fontWeight: 600 }}>
          Time Cards Management
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>{new Date().toLocaleDateString()}</Typography>
      </Box>

      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2, boxShadow: 1, backgroundColor: isDarkMode ? "#1c2541" : "background.paper" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField select fullWidth size="small" label="Employee" value={selectedEmployee} sx={filterInputStyles}
              onChange={(e) => handleEmployeeChange(e.target.value ? Number(e.target.value) : "")}>
              {employees.map(emp => (
                <MenuItem key={emp.id} value={emp.id}>{emp.emp_code} - {emp.full_name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField select fullWidth size="small" label="Year" value={year} onChange={(e) => setYear(e.target.value)} sx={filterInputStyles}>
              {YEARS.map(yr => <MenuItem key={yr} value={yr}>{yr}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField select fullWidth size="small" label="Month" value={month} onChange={(e) => setMonth(Number(e.target.value))} sx={filterInputStyles}>
              {MONTHS.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: "flex", gap: 1 }}>
            <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={handleLoadButton}
              disabled={loading || !selectedEmployee}
              sx={{ bgcolor: "#1976d2", "&:hover": { bgcolor: "#1565c0" }, textTransform: "none" }}>
              {loading ? "Loading..." : "Load"}
            </Button>
            
            <Button 
              variant="outlined" 
              startIcon={<ReceiptLongIcon />} 
              disabled={!selectedEmployee}
              onClick={() => window.open(`/payroll/detail-sheets?employee_id=${selectedEmployee}&year=${year}&month=${month}`, "_blank")}
              sx={{ textTransform: "none", color: isDarkMode ? "#cbd5e1" : "#2c3e50", borderColor: isDarkMode ? "#475569" : "#cbd5e1" }}
            >
              Detail Sheet
            </Button>
            
            <Button 
              variant="outlined" 
              startIcon={<PaymentsIcon />} 
              disabled={!selectedEmployee}
              onClick={() => window.open(`/payroll/slips?employee_id=${selectedEmployee}&year=${year}&month=${month}`, "_blank")}
              sx={{ textTransform: "none", color: isDarkMode ? "#cbd5e1" : "#2c3e50", borderColor: isDarkMode ? "#475569" : "#cbd5e1" }}
            >
              Pay Slip
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" }, 
          justifyContent: "space-between", 
          alignItems: { xs: "stretch", sm: "center" }, 
          gap: 2, 
          mb: 1.5, 
          px: 0.5 
        }}
      >
        <Box 
          sx={{ 
            display: "flex", 
            flexDirection: { xs: "column", md: "row" }, 
            alignItems: { xs: "flex-start", md: "center" }, 
            gap: { xs: 1.5, md: 4 } 
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: isDarkMode ? "#cbd5e1" : "#2c3e50" }}>
            Employee ID: {selectedEmployee || "None"} - Monthly Sheet
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: { xs: "100%", md: "auto" } }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: isDarkMode ? "#90caf9" : "#024271", whiteSpace: "nowrap" }}>
              Shift Selection:
            </Typography>
            <Select 
              size="small" 
              value={globalShift} 
              onChange={(e) => handleShiftChange(e.target.value)}
              sx={{ 
                fontSize: "0.85rem", 
                height: 32, 
                width: { xs: "100%", sm: 130 }, 
                bgcolor: isDarkMode ? "#131a30" : "#fff", 
                color: isDarkMode ? "#cbd5e1" : "text.primary", 
                fontWeight: 600, 
                "& .MuiOutlinedInput-notchedOutline": { borderColor: isDarkMode ? "#2e3b63" : "#cbd5e1" } 
              }}
            >
              <MenuItem value="8-2">8-2 (08.00 - 14.00)</MenuItem>
              <MenuItem value="2-10">2-10 (14.00 - 22.00)</MenuItem>
              <MenuItem value="Custom">Custom</MenuItem>
            </Select>
          </Box>
        </Box>
        
        <Button 
          variant="contained" 
          startIcon={<SaveIcon />} 
          onClick={handleSave} 
          disabled={!selectedEmployee}
          sx={{ 
            bgcolor: "#1976d2", 
            "&:hover": { bgcolor: "#1565c0" }, 
            textTransform: "none",
            height: 36,
            width: { xs: "100%", sm: "auto" }
          }}
        >
          Save Time Card
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ 
        borderRadius: 2, 
        boxShadow: 1, 
        maxHeight: "60vh", 
        maxWidth: "100%", 
        overflowX: "auto", 
        backgroundColor: isDarkMode ? "#1c2541" : "background.paper"
      }}>
        <Table stickyHeader size="small" sx={{ minWidth: 1900, tableLayout: "auto", borderCollapse: "separate" }}>
          <TableHead>
            <TableRow sx={{ 
              "& th": { 
                bgcolor: isDarkMode ? "#131a30" : "#aacdfa", 
                fontWeight: 700, 
                color: isDarkMode ? "#90caf9" : "#024271", 
                fontSize: "0.75rem", 
                // මෙතනින් සුදු පාට lines සම්පූර්ණයෙන්ම ඉවත් කරලා තියෙනවා:
                border: "none !important",
                boxShadow: "none !important",
                borderBottom: isDarkMode ? "1px solid #2e3b63 !important" : "1px solid #aacdfa !important",
                padding: "6px 4px",
                backgroundImage: "none" 
              } 
            }}>
              <TableCell style={{ width: 110, whiteSpace: "nowrap" }}>DATE</TableCell>
              <TableCell style={{ width: 45 }}>DAY</TableCell>
              <TableCell style={{ width: 95 }}>STATUS</TableCell>
              <TableCell align="center" style={{ width: 140 }}>SHIFT TIMES</TableCell>
              <TableCell align="center" style={{ width: 65 }}>HOURS</TableCell>
              {products.map(p => <TableCell key={p.id} align="center">{p.product_name}</TableCell>)}
              
              <TableCell align="center" style={{ fontWeight: 800, color: isDarkMode ? "#90caf9" : "#024271" }}>PROD. PAY</TableCell>
              <TableCell align="center">OT AMOUNT</TableCell>
              <TableCell align="center">DAY DUTY</TableCell>
              <TableCell align="center">TRAVEL</TableCell>
              <TableCell align="center">OTHER</TableCell>
              <TableCell align="center" style={{ width: 80 }}>GROSS</TableCell>
              <TableCell align="center" style={{ width: 150 }}>NOTES</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {daysData.map((row, idx) => {
              const displayProdPay = calcProductionPayRow(row, products);
              const displayGross = calcGross(row, products);
              const rowBg = getRowBgColor(row.day, isDarkMode);
              const inputBg = (row.status !== "work") ? (isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)") : "transparent";
              const isLeave = row.status === "leave";

              return (
                <TableRow 
                  key={idx} 
                  sx={{ 
                    bgcolor: rowBg, 
                    "& td": { 
                      padding: "4px 4px", 
                      bgcolor: "inherit",
                      borderBottom: isDarkMode ? "1px solid #2e3b63" : "1px solid #e0e0e0"
                    } 
                  }}
                >
                  <TableCell sx={{ fontSize: "0.8rem", fontWeight: 500, whiteSpace: "nowrap", color: isDarkMode ? "#cbd5e1" : "text.primary" }}>{row.date}</TableCell>
                  <TableCell sx={{ fontSize: "0.8rem", color: isDarkMode ? "#94a3b8" : "text.secondary" }}>{row.day}</TableCell>
                  <TableCell>
                    <Select size="small" value={row.status} onChange={(e) => handleRowChange(idx, "status", e.target.value)}
                      sx={{ fontSize: "0.85rem", height: 32, width: 90, bgcolor: isDarkMode ? "#131a30" : "#fff", color: isDarkMode ? "#cbd5e1" : "text.primary", fontWeight: 500, "& .MuiOutlinedInput-notchedOutline": { borderColor: isDarkMode ? "#2e3b63" : "#cbd5e1" } }}>
                      <MenuItem value="work">Work</MenuItem>
                      <MenuItem value="holiday">Holiday</MenuItem>
                      <MenuItem value="leave">Leave</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center", alignItems: "center" }}>
                      <InputBase value={row.start_time || ""} disabled={row.status !== "work"}
                        onChange={(e) => handleRowChange(idx, "start_time", e.target.value)}
                        sx={{ border: isDarkMode ? "1px solid #2e3b63" : "1px solid #b0bec5", borderRadius: 1, px: 0.5, fontSize: "0.8rem", fontWeight: 600, width: 55, height: 32, bgcolor: inputBg, color: isDarkMode ? "#cbd5e1" : "text.primary", input: { textAlign: "center" } }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>-</Typography>
                      <InputBase value={row.end_time || ""} disabled={row.status !== "work"}
                        onChange={(e) => handleRowChange(idx, "end_time", e.target.value)}
                        sx={{ border: isDarkMode ? "1px solid #2e3b63" : "1px solid #b0bec5", borderRadius: 1, px: 0.5, fontSize: "0.8rem", fontWeight: 600, width: 55, height: 32, bgcolor: inputBg, color: isDarkMode ? "#cbd5e1" : "text.primary", input: { textAlign: "center" } }} />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <InputBase 
                      value={row.hours || ""} 
                      disabled={isLeave} 
                      onChange={(e) => handleRowChange(idx, "hours", e.target.value)}
                      sx={tableInputStyles(isLeave)} 
                    />
                  </TableCell>
                  {products.map(prod => (
                    <TableCell key={prod.id} align="center">
                      <InputBase 
                        value={row.product_quantities[prod.id] === 0 ? "" : row.product_quantities[prod.id] || ""}
                        placeholder="0"
                        disabled={isLeave} 
                        onChange={(e) => handleQtyChange(idx, prod.id, e.target.value)}
                        sx={tableInputStyles(isLeave)} 
                      />
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontSize: "0.85rem", fontWeight: 700, color: isDarkMode ? "#90caf9" : "#1976d2" }}>
                    {displayProdPay > 0 ? displayProdPay.toFixed(2) : "-"}
                  </TableCell>
                  {(["ot_hours", "day_duty", "travelling", "other_allowance"] as const).map(field => (
                    <TableCell key={field} align="center">
                      <InputBase 
                        value={row[field] || ""} 
                        disabled={isLeave}
                        onChange={(e) => handleRowChange(idx, field, e.target.value)}
                        sx={tableInputStyles(isLeave)} 
                      />
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontSize: "0.85rem", fontWeight: 700, color: isDarkMode ? "#90caf9" : "#1976d2" }}>
                    {displayGross}
                  </TableCell>
                  <TableCell align="center">
                    <InputBase value={row.notes || ""} placeholder="Add notes..." onChange={(e) => handleRowChange(idx, "notes", e.target.value)}
                      sx={{ border: isDarkMode ? "1px solid #2e3b63" : "1px solid #b0bec5", borderRadius: 1, px: 1, fontSize: "0.8rem", width: "100%", height: 32, color: isDarkMode ? "#cbd5e1" : "text.primary", bgcolor: "transparent" }} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
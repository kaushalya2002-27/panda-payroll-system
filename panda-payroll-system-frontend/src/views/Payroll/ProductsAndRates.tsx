import React, { useState, useEffect } from "react";
import axios from "axios"; 
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
  Chip,
  IconButton,
  InputAdornment,
  CircularProgress
} from "@mui/material";

// Icons
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ClearIcon from "@mui/icons-material/Clear";
import { useTheme } from "@mui/material/styles"; 
import useCurrentUser from "../../hooks/useCurrentUser";
import { PermissionKeys } from "../Administration/SectionList";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

export default function ProductsAndRates() {
  const theme = useTheme(); 
  const isDarkMode = theme.palette.mode === "dark";
  const { user } = useCurrentUser();
  const userPermissionObject = user?.permissionObject;

  // Form States
  const [editId, setEditId] = useState<number | null>(null); 
  const [productName, setProductName] = useState("");
  const [targetMonFri, setTargetMonFri] = useState("");
  const [targetSaturday, setTargetSaturday] = useState("");
  const [rateAbove, setRateAbove] = useState("");
  const [rateBelow, setRateBelow] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [status, setStatus] = useState("Active");

  // Products List State & Loading State
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/payroll-products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to load products from database!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = async () => {
    if (!productName.trim()) {
      alert("Product Name is required!");
      return;
    }

    const payload = {
      product_name: productName,
      target_weekday: parseInt(targetMonFri) || 0,
      target_saturday: parseInt(targetSaturday) || 0,
      rate_above: parseFloat(rateAbove) || 0.0,
      rate_below: parseFloat(rateBelow) || 0.0,
      sort_order: parseInt(sortOrder) || 0,
      status: status,
    };

    try {
      if (editId) {
        await axios.put(`${API_BASE_URL}/payroll-products/${editId}`, payload);
        alert("Product updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/payroll-products`, payload);
        alert("Product added successfully!");
      }
      handleClear();
      fetchProducts(); 
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error occurred while saving data!");
    }
  };

  const handleEditClick = (row: any) => {
    setEditId(row.id);
    setProductName(row.product_name);
    setTargetMonFri(row.target_weekday.toString());
    setTargetSaturday(row.target_saturday.toString());
    setRateAbove(row.rate_above.toString());
    setRateBelow(row.rate_below.toString());
    setSortOrder(row.sort_order.toString());
    setStatus(row.status);
  };

  const handleClear = () => {
    setEditId(null);
    setProductName("");
    setTargetMonFri("");
    setTargetSaturday("");
    setRateAbove("");
    setRateBelow("");
    setSortOrder("0");
    setStatus("Active");
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/payroll-products/${id}`);
      alert("Product deleted successfully!");
      if (editId === id) {
        handleClear();
      }
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error occurred while deleting product!");
    }
  };

  const canDelete = userPermissionObject?.[PermissionKeys.PAYROLL_PRODUCTS_RATES_DELETE];
  const canEdit = userPermissionObject?.[PermissionKeys.PAYROLL_PRODUCTS_RATES_EDIT];
  const canCreate = userPermissionObject?.[PermissionKeys.PAYROLL_PRODUCTS_RATES_CREATE];

  return (
    <Box sx={{ p: 3, bgcolor: isDarkMode ? "transparent" : "#f8f9fa", minHeight: "100vh" }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: isDarkMode ? "#90caf9" : "#1e293b", fontWeight: 700, fontSize: "1.5rem" }}>
          Products & Rates
        </Typography>        
      </Box>

      {/* Main Content Layout */}
      <Grid container spacing={3}>
        
        {/* Left Column: Products Table */}
        <Grid item xs={12} lg={7.5}>
          <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)", border: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0", backgroundColor: isDarkMode ? "#1c2541" : "background.paper" }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ color: isDarkMode ? "#cbd5e1" : "#1e293b", fontWeight: 700 }}>
                Products & Production Rates
              </Typography>              
            </Box>

            <TableContainer sx={{ border: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0", borderRadius: 1.5 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ "& th": { bgcolor: isDarkMode ? "#131a30" : "#aacdfa", color: isDarkMode ? "#90caf9" : "#024271", fontWeight: 700, fontSize: "0.75rem", py: 1.5 } }}>
                    <TableCell align="center">#</TableCell>
                    <TableCell>PRODUCT</TableCell>
                    <TableCell>TARGET WKDAY</TableCell>
                    <TableCell>TARGET SAT</TableCell>
                    <TableCell>RATE ABOVE</TableCell>
                    <TableCell>RATE BELOW</TableCell>
                    <TableCell align="center">STATUS</TableCell>
                    {canEdit && <TableCell align="center">EDIT</TableCell>}
                    {canDelete && <TableCell align="center">DELETE</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7 + (canEdit ? 1 : 0) + (canDelete ? 1 : 0)} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7 + (canEdit ? 1 : 0) + (canDelete ? 1 : 0)} align="center" sx={{ py: 3, color: isDarkMode ? "#94a3b8" : "#64748b" }}>
                        No products found. Add a new one!
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((row, index) => (
                      <TableRow key={row.id} hover sx={{ "& hover": { bgcolor: isDarkMode ? "#242f55" : "#f8fafc" }, "& td": { py: 1.2, borderBottom: isDarkMode ? "1px solid #2e3b63" : "1px solid #f1f5f9", color: isDarkMode ? "#cbd5e1" : "inherit" } }}>
                        <TableCell align="center" sx={{ color: isDarkMode ? "#94a3b8" : "#64748b", fontSize: "0.8rem" }}>{index + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: isDarkMode ? "#fff" : "#1e293b", fontSize: "0.85rem" }}>{row.product_name}</TableCell>
                        <TableCell sx={{ color: isDarkMode ? "#cbd5e1" : "#334155", fontSize: "0.85rem" }}>{row.target_weekday} units</TableCell>
                        <TableCell sx={{ color: isDarkMode ? "#cbd5e1" : "#334155", fontSize: "0.85rem" }}>{row.target_saturday} units</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: isDarkMode ? "#90caf9" : "#024271", fontSize: "0.85rem" }}>Rs. {row.rate_above}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "#475569", fontSize: "0.85rem" }}>Rs. {row.rate_below}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={row.status} 
                            size="small" 
                            variant={isDarkMode ? "outlined" : "filled"}
                            color={row.status === "Active" ? "success" : "error"}
                            sx={{ 
                              fontWeight: 600, fontSize: "0.75rem", height: "20px", borderRadius: "6px",
                              ...(!isDarkMode && {
                                bgcolor: row.status === "Active" ? "#e0f2fe" : "#fee2e2", 
                                color: row.status === "Active" ? "#0369a1" : "#b91c1c", 
                              })
                            }} 
                          />
                        </TableCell>
                        {canEdit && (
                          <TableCell align="center">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditClick(row)}
                              sx={{ border: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0", borderRadius: 1.2, p: 0.5, color: isDarkMode ? "#94a3b8" : "#64748b", "&:hover": { bgcolor: isDarkMode ? "#131a30" : "#f1f5f9" } }}
                            >
                              <EditIcon sx={{ fontSize: "0.95rem" }} />
                            </IconButton>
                          </TableCell>
                        )}
                        {canDelete && (
                          <TableCell align="center">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDelete(row.id)}
                              sx={{ border: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0", borderRadius: 1.2, p: 0.5, color: isDarkMode ? "#f87171" : "#dc2626", "&:hover": { bgcolor: isDarkMode ? "#131a30" : "#fef2f2" } }}
                            >
                              <DeleteIcon sx={{ fontSize: "0.95rem" }} />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right Column: Add / Edit Product Form */}
        {((!editId && canCreate) || (editId && canEdit)) && (
        <Grid item xs={12} lg={4.5}>
          <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)", border: isDarkMode ? "1px solid #2e3b63" : "1px solid #e2e8f0", backgroundColor: isDarkMode ? "#1c2541" : "background.paper" }}>
            <Typography variant="subtitle1" sx={{ color: isDarkMode ? "#cbd5e1" : "#1e293b", fontWeight: 700, mb: 2.5 }}>
              {editId ? "Edit Product" : "Add Product"}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Product Name */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "#475569", display: "block", mb: 0.5 }}>
                  Product Name <span style={{ color: "#ef4444" }}>*</span>
                </Typography>
                <TextField 
                  fullWidth 
                  size="small" 
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter product name"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5, backgroundColor: isDarkMode ? "#131a30" : "#ffffff", "& fieldset": { borderColor: isDarkMode ? "#2e3b63" : "#ced4da" } }, "& .MuiInputBase-input": { color: isDarkMode ? "#fff" : "inherit" } }} 
                />
              </Box>

              {/* Targets */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "#475569", display: "block", mb: 0.5 }}>Target Mon–Fri</Typography>
                  <TextField 
                    fullWidth 
                    size="small" 
                    type="number"
                    value={targetMonFri}
                    onChange={(e) => setTargetMonFri(e.target.value)}
                    InputProps={{ endAdornment: <InputAdornment position="end"><span style={{ fontSize: "0.75rem", color: isDarkMode ? "#94a3b8" : "#64748b" }}>units</span></InputAdornment> }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5, backgroundColor: isDarkMode ? "#131a30" : "#ffffff", "& fieldset": { borderColor: isDarkMode ? "#2e3b63" : "#ced4da" } }, "& .MuiInputBase-input": { color: isDarkMode ? "#fff" : "inherit" } }} 
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "#475569", display: "block", mb: 0.5 }}>Target Saturday</Typography>
                  <TextField 
                    fullWidth 
                    size="small" 
                    type="number"
                    value={targetSaturday}
                    onChange={(e) => setTargetSaturday(e.target.value)}
                    InputProps={{ endAdornment: <InputAdornment position="end"><span style={{ fontSize: "0.75rem", color: isDarkMode ? "#94a3b8" : "#64748b" }}>units</span></InputAdornment> }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5, backgroundColor: isDarkMode ? "#131a30" : "#ffffff", "& fieldset": { borderColor: isDarkMode ? "#2e3b63" : "#ced4da" } }, "& .MuiInputBase-input": { color: isDarkMode ? "#fff" : "inherit" } }} 
                  />
                </Grid>
              </Grid>

              {/* Rates */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "#475569", display: "block", mb: 0.5 }}>Rate — Above target</Typography>
                  <TextField 
                    fullWidth 
                    size="small" 
                    type="number"
                    value={rateAbove}
                    onChange={(e) => setRateAbove(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><span style={{ fontSize: "0.8rem", color: isDarkMode ? "#94a3b8" : "#64748b" }}>Rs.</span></InputAdornment> }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5, backgroundColor: isDarkMode ? "#131a30" : "#ffffff", "& fieldset": { borderColor: isDarkMode ? "#2e3b63" : "#ced4da" } }, "& .MuiInputBase-input": { color: isDarkMode ? "#fff" : "inherit" } }} 
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "#475569", display: "block", mb: 0.5 }}>Rate — Below target</Typography>
                  <TextField 
                    fullWidth 
                    size="small" 
                    type="number"
                    value={rateBelow}
                    onChange={(e) => setRateBelow(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><span style={{ fontSize: "0.8rem", color: isDarkMode ? "#94a3b8" : "#64748b" }}>Rs.</span></InputAdornment> }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5, backgroundColor: isDarkMode ? "#131a30" : "#ffffff", "& fieldset": { borderColor: isDarkMode ? "#2e3b63" : "#ced4da" } }, "& .MuiInputBase-input": { color: isDarkMode ? "#fff" : "inherit" } }} 
                  />
                </Grid>
              </Grid>

              {/* Sort Order & Status */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "#475569", display: "block", mb: 0.5 }}>Sort Order</Typography>
                  <TextField 
                    fullWidth 
                    size="small" 
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5, backgroundColor: isDarkMode ? "#131a30" : "#ffffff", "& fieldset": { borderColor: isDarkMode ? "#2e3b63" : "#ced4da" } }, "& .MuiInputBase-input": { color: isDarkMode ? "#fff" : "inherit" } }} 
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#94a3b8" : "#475569", display: "block", mb: 0.5 }}>Status</Typography>
                  <TextField 
                    select 
                    fullWidth 
                    size="small" 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5, backgroundColor: isDarkMode ? "#131a30" : "#ffffff", "& fieldset": { borderColor: isDarkMode ? "#2e3b63" : "#ced4da" } }, "& .MuiSelect-select": { color: isDarkMode ? "#fff" : "inherit" } }}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 1.5, mt: 1.5 }}>
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
        )}

      </Grid>
    </Box>
  );
}
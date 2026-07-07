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
  Alert,
  CircularProgress
} from "@mui/material";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import { useTheme } from "@mui/material/styles"; 

// Icons
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

const API_BASE_URL = "http://localhost:8000/api/payroll";

interface Department {
  id: number;
  name: string;
}

interface JobPosition {
  id: number;
  name: string;
}

interface FormErrors {
  fullName?: string;
  nic?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  designation?: string;
  dob?: string;
  joinDate?: string;
  departmentId?: string;
}

export default function EditEmployee() {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark"; 

  // Loading & Feedback States
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]); 
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Image States
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [empCode, setEmpCode] = useState<string>("");

  const [formData, setFormData] = useState({
    fullName: "",
    nic: "",
    gender: "",
    dob: "",
    joinDate: "",
    phone: "",
    email: "",
    address: "",
    departmentId: "",
    designation: "", 
    bankName: "",
    branch: "",
    accountNumber: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelationship: "",
    isActive: 1
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Departments ලබා ගැනීම
        const deptResponse = await axios.get(`${API_BASE_URL}/departments`);
        setDepartments(deptResponse.data);

        // 2. Job Positions ලබා ගැනීම
        try {
          const posResponse = await axios.get(`${API_BASE_URL}/job-positions`);
          setJobPositions(posResponse.data);
        } catch (posErr) {
          console.error("Error loading job positions:", posErr);
        }

        // 3. දැනට ඉන්න Employee ගේ ඩේටා ලබා ගැනීම
        const empResponse = await axios.get(`${API_BASE_URL}/employees/${id}`);
        const emp = empResponse.data;

        setEmpCode(emp.emp_code || "");
        setFormData({
          fullName: emp.full_name || "",
          nic: emp.nic || "",
          gender: emp.gender || "",
          dob: emp.date_of_birth || "",
          joinDate: emp.join_date || "",
          phone: emp.phone || "",
          email: emp.email || "",
          address: emp.address || "",
          departmentId: emp.department_id ? emp.department_id.toString() : "",
          designation: emp.designation || "", 
          bankName: emp.bank_name || "",
          branch: emp.bank_branch || "",
          accountNumber: emp.account_number || "",
          emergencyName: emp.emergency_name || "",
          emergencyPhone: emp.emergency_phone || "",
          emergencyRelationship: emp.emergency_relation || "",
          isActive: emp.is_active ?? 1
        });

        if (emp.photo) {
          setImagePreview(`http://localhost:8000/uploads/employees/${emp.photo}`);
        }
      } catch (error) {
        console.error("Error loading employee data for editing:", error);
        setErrorMsg("Failed to load employee details.");
      } finally {
        setPageLoading(false);
      }
    };

    if (id) fetchInitialData();
  }, [id]);

  const validateField = (field: string, value: string) => {
    let errorText = "";

    if (field === "fullName" && !value.trim()) {
      errorText = "Full Name is required.";
    } 
    else if (field === "gender" && !value) {
      errorText = "Gender is required.";
    }
    else if (field === "dob" && !value) {
      errorText = "Date of Birth is required.";
    }
    else if (field === "joinDate" && !value) {
      errorText = "Join Date is required.";
    }
    else if (field === "departmentId" && !value) {
      errorText = "Department selection is required.";
    }
    else if (field === "designation" && !value.trim()) {
      errorText = "Designation is required.";
    }
    else if (field === "address" && !value.trim()) {
      errorText = "Address is required.";
    }
    else if (field === "nic") {
      if (!value.trim()) {
        errorText = "NIC is required.";
      } else {
        const oldNicRegex = /^[0-9]{9}[vVxX]$/;
        const newNicRegex = /^[0-9]{12}$/;
        if (!oldNicRegex.test(value) && !newNicRegex.test(value)) {
          errorText = "Invalid NIC format (e.g., 123456789V or 123456789012).";
        }
      }
    } 
    else if (field === "phone") {
      if (!value.trim()) {
        errorText = "Phone number is required.";
      } else if (!/^\d+$/.test(value)) {
        errorText = "Phone number must contain only digits.";
      } else if (value.length !== 10) {
        errorText = "Phone number must be exactly 10 digits.";
      }
    } 
    else if (field === "email" && value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errorText = "Invalid format. Example: user@domain.com";
      }
    }

    setErrors(prev => ({ ...prev, [field]: errorText }));
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: string, value: string) => {
    validateField(field, value);
  };

  const validateAllFields = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required.";
    if (!formData.gender) newErrors.gender = "Gender is required.";
    if (!formData.dob) newErrors.dob = "Date of Birth is required.";
    if (!formData.joinDate) newErrors.joinDate = "Join Date is required.";
    if (!formData.departmentId) newErrors.departmentId = "Department is required.";
    if (!formData.designation.trim()) newErrors.designation = "Designation is required.";
    if (!formData.address.trim()) newErrors.address = "Address is required.";
    
    if (!formData.nic.trim()) {
      newErrors.nic = "NIC is required.";
    } else {
      const oldNicRegex = /^[0-9]{9}[vVxX]$/;
      const newNicRegex = /^[0-9]{12}$/;
      if (!oldNicRegex.test(formData.nic) && !newNicRegex.test(formData.nic)) {
        newErrors.nic = "Invalid NIC format (e.g., 123456789V or 123456789012).";
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Phone number must contain only digits.";
    } else if (formData.phone.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid format. Example: user@domain.com";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("Upload failed! Image size exceeds the 2MB maximum limit.");        
        setSelectedImage(null); 
        e.target.value = ""; 
        return;
      }      
      
      setErrorMsg(null); 
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!validateAllFields()) {
      setErrorMsg("Please fix the validation errors before saving changes.");
      return;
    }

    setSubmitLoading(true);

    const dataToSend = new FormData();
    // 💡 Laravel PUT/PATCH bug එක මගහැරීමට Method Spoofing භාවිතා කර ඇත
    dataToSend.append("_method", "PUT"); 

    dataToSend.append("full_name", formData.fullName);
    dataToSend.append("nic", formData.nic);
    dataToSend.append("gender", formData.gender);
    dataToSend.append("date_of_birth", formData.dob);
    dataToSend.append("join_date", formData.joinDate);
    dataToSend.append("phone", formData.phone);
    dataToSend.append("email", formData.email);
    dataToSend.append("address", formData.address);
    dataToSend.append("department_id", formData.departmentId);
    dataToSend.append("designation", formData.designation);
    dataToSend.append("bank_name", formData.bankName);
    dataToSend.append("bank_branch", formData.branch); 
    dataToSend.append("account_number", formData.accountNumber);
    dataToSend.append("emergency_name", formData.emergencyName);
    dataToSend.append("emergency_phone", formData.emergencyPhone);
    dataToSend.append("emergency_relation", formData.emergencyRelationship);
    dataToSend.append("is_active", formData.isActive.toString());

    if (selectedImage) {
      dataToSend.append("photo", selectedImage); 
    }

    try {
      // 💡 Request එක POST එකක් ලෙස යවන්නේ method spoofing නිසාය
      const response = await axios.post(`${API_BASE_URL}/employees/${id}`, dataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.status === 200 || response.status === 201) {
        setSuccessMsg("Employee details updated successfully!");
        
        if (response.data.photo) {
          setImagePreview(`http://localhost:8000/uploads/employees/${response.data.photo}`);
        }

        setTimeout(() => {
          navigate(`/payroll/employees/${id}`);
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error updating employee:", error);
      setErrorMsg(error.response?.data?.message || "Failed to update employee details.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const cardStyles = {
    p: 3,
    borderRadius: 3,
    boxShadow: "0px 2px 10px rgba(0,0,0,0.03)",
    backgroundColor: isDarkMode ? "#1c2541" : "background.paper",
    border: isDarkMode ? "1px solid #2e3b63" : "none"
  };

  const sectionHeaderStyles = {
    fontWeight: 700,
    mb: 2.5,
    color: isDarkMode ? "#90caf9" : "#003566"
  };

  return (
    <Box component="form" onSubmit={handleUpdate} noValidate sx={{ p: 1 }}>
      {/* Page Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h5" sx={{ color: isDarkMode ? "#ffffff" : "#024271", fontWeight: 700 }}>
          Edit Employee: <span style={{ color: isDarkMode ? "#94a3b8" : "#64748b", fontWeight: 500 }}>{formData.fullName}</span>
        </Typography>
      </Box>

      {errorMsg && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{errorMsg}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{successMsg}</Alert>}

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={3.5}>
          <Paper sx={{ ...cardStyles, textAlign: "center", height: "100%" }}>
            <Typography variant="subtitle2" align="left" sx={{ fontWeight: 700, color: isDarkMode ? "#94a3b8" : "text.secondary", mb: 3 }}>
              Employee Photo
            </Typography>

            <input 
              type="file" 
              accept="image/png, image/jpeg, image/jpg" 
              id="edit-photo-upload" 
              style={{ display: "none" }} 
              onChange={handleImageChange} 
            />
            <label htmlFor="edit-photo-upload">
              <Box
                sx={{
                  width: 140,
                  height: 140,
                  borderRadius: "50%",
                  border: isDarkMode ? "2px dashed #475569" : "2px dashed #b0bec5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  cursor: "pointer",
                  bgcolor: isDarkMode ? "#131a30" : "#f8f9fa",
                  backgroundImage: imagePreview ? `url(${imagePreview})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": { borderColor: isDarkMode ? "#90caf9" : "#1a73e8", bgcolor: isDarkMode ? "#1e294b" : "#f0f4f8" },
                  mb: 2
                }}
              >
                {!imagePreview && <CameraAltIcon sx={{ color: "text.disabled", fontSize: 32 }} />}
              </Box>
            </label>

            <Typography variant="caption" sx={{ color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 3 }}>
              Click image to change
            </Typography>

            <Divider sx={{ my: 2.5, borderColor: isDarkMode ? "#2e3b63" : "divider" }} />

            <Box sx={{ mb: 3, mt: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: isDarkMode ? "#94a3b8" : "text.secondary", display: "block", mb: 1, textAlign: "left" }}>
                Employee Code
              </Typography>
              <TextField 
                fullWidth 
                size="small" 
                value={empCode} 
                disabled 
                sx={{
                  "& .MuiOutlinedInput-root.Mui-disabled": {
                    backgroundColor: isDarkMode ? "#131a30" : "#f1f5f9",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: isDarkMode ? "#2e3b63" : "#cbd5e1" }
                  }
                }}
                inputProps={{ style: { textAlign: "center", fontWeight: 700, color: isDarkMode ? "#cbd5e1" : "#475569" } }} 
              />
            </Box>

            <Box sx={{ textAlign: "left" }}>
              <TextField
                select
                label="Status"
                fullWidth
                size="small"
                value={formData.isActive}
                onChange={(e) => handleChange("isActive", Number(e.target.value))}
              >
                <MenuItem value={1}>Active</MenuItem>
                <MenuItem value={0}>Inactive</MenuItem>
              </TextField>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={8.5}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            
            {/* Personal Information */}
            <Paper sx={cardStyles}>
              <Typography variant="subtitle1" sx={sectionHeaderStyles}>
                Personal Information
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Full Name" 
                    required 
                    fullWidth 
                    size="small" 
                    value={formData.fullName} 
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    onBlur={(e) => handleBlur("fullName", e.target.value)}
                    error={!!errors.fullName}
                    helperText={errors.fullName}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField 
                    label="NIC" 
                    required 
                    fullWidth 
                    size="small" 
                    value={formData.nic} 
                    onChange={(e) => handleChange("nic", e.target.value)}
                    onBlur={(e) => handleBlur("nic", e.target.value)}
                    error={!!errors.nic}
                    helperText={errors.nic}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField 
                    select 
                    label="Gender" 
                    required 
                    fullWidth 
                    size="small" 
                    value={formData.gender} 
                    onChange={(e) => handleChange("gender", e.target.value)}
                    onBlur={(e) => handleBlur("gender", e.target.value)}
                    error={!!errors.gender}
                    helperText={errors.gender}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField 
                    label="Date of Birth" 
                    required 
                    fullWidth 
                    size="small" 
                    type="date" 
                    InputLabelProps={{ shrink: true }} 
                    value={formData.dob} 
                    onChange={(e) => handleChange("dob", e.target.value)} 
                    onBlur={(e) => handleBlur("dob", e.target.value)}
                    error={!!errors.dob}
                    helperText={errors.dob}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField 
                    label="Join Date" 
                    required 
                    fullWidth 
                    size="small" 
                    type="date" 
                    InputLabelProps={{ shrink: true }} 
                    value={formData.joinDate} 
                    onChange={(e) => handleChange("joinDate", e.target.value)} 
                    onBlur={(e) => handleBlur("joinDate", e.target.value)}
                    error={!!errors.joinDate}
                    helperText={errors.joinDate}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField 
                    label="Phone" 
                    required 
                    fullWidth 
                    size="small" 
                    value={formData.phone} 
                    onChange={(e) => handleChange("phone", e.target.value)}
                    onBlur={(e) => handleBlur("phone", e.target.value)}
                    error={!!errors.phone}
                    helperText={errors.phone}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    label="Email" 
                    type="email" 
                    fullWidth 
                    size="small" 
                    value={formData.email} 
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={(e) => handleBlur("email", e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    label="Address" 
                    required 
                    fullWidth 
                    size="small" 
                    multiline 
                    rows={2} 
                    value={formData.address} 
                    onChange={(e) => handleChange("address", e.target.value)}
                    onBlur={(e) => handleBlur("address", e.target.value)}
                    error={!!errors.address}
                    helperText={errors.address}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Job Details Section */}
            <Paper sx={cardStyles}>
              <Typography variant="subtitle1" sx={sectionHeaderStyles}>
                Job Details
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    select 
                    label="Department" 
                    required 
                    fullWidth 
                    size="small" 
                    value={formData.departmentId} 
                    onChange={(e) => handleChange("departmentId", e.target.value)}
                    onBlur={(e) => handleBlur("departmentId", e.target.value)}
                    error={!!errors.departmentId}
                    helperText={errors.departmentId}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField 
                    select
                    label="Designation" 
                    required 
                    fullWidth 
                    size="small" 
                    value={formData.designation} 
                    onChange={(e) => handleChange("designation", e.target.value)}
                    onBlur={(e) => handleBlur("designation", e.target.value)}
                    error={!!errors.designation}
                    helperText={errors.designation}
                  >
                    {jobPositions.map((pos) => (
                      <MenuItem key={pos.id} value={pos.name}>
                        {pos.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            {/* Bank Details */}
            <Paper sx={cardStyles}>
              <Typography variant="subtitle1" sx={sectionHeaderStyles}>
                Bank Details
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={4}>
                  <TextField label="Bank Name" fullWidth size="small" value={formData.bankName} onChange={(e) => handleChange("bankName", e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="Branch" fullWidth size="small" value={formData.branch} onChange={(e) => handleChange("branch", e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="Account Number" fullWidth size="small" value={formData.accountNumber} onChange={(e) => handleChange("accountNumber", e.target.value)} />
                </Grid>
              </Grid>
            </Paper>

            {/* Emergency Contact */}
            <Paper sx={cardStyles}>
              <Typography variant="subtitle1" sx={sectionHeaderStyles}>
                Emergency Contact
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={4}>
                  <TextField label="Contact Name" fullWidth size="small" value={formData.emergencyName} onChange={(e) => handleChange("emergencyName", e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="Phone" fullWidth size="small" value={formData.emergencyPhone} onChange={(e) => handleChange("emergencyPhone", e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="Relationship" fullWidth size="small" value={formData.emergencyRelationship} onChange={(e) => handleChange("emergencyRelationship", e.target.value)} />
                </Grid>
              </Grid>
            </Paper>

            {/* Actions Buttons */}
            <Box sx={{ display: "flex", gap: 2, mt: 1, mb: 4 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={submitLoading}
                startIcon={submitLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{ 
                  bgcolor: isDarkMode ? "#004494" : "#0056b3", 
                  "&:hover": { bgcolor: "#003566" },
                  textTransform: "none", 
                  px: 4,
                  borderRadius: 1.5,
                  fontWeight: 600
                }}
              >
                {submitLoading ? "Updating..." : "Save Changes"}
              </Button>
              <Button
                variant="outlined"
                disabled={submitLoading}
                startIcon={<CloseIcon />}
                onClick={() => navigate(`/payroll/employees/${id}`)}
                sx={{ 
                  color: isDarkMode ? "#cbd5e1" : "#475569", 
                  borderColor: isDarkMode ? "#475569" : "#cbd5e1", 
                  "&:hover": {
                    borderColor: isDarkMode ? "#94a3b8" : "#94a3b8",
                    bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc"
                  },
                  textTransform: "none", 
                  px: 4,
                  borderRadius: 1.5,
                  fontWeight: 600
                }}
              >
                Cancel
              </Button>
            </Box>

          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
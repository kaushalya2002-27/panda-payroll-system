import {
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Autocomplete,
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import groupLogo from "../../assets/group-logo.png";
import { useForm, Controller } from "react-hook-form";
import CustomButton from "../../components/CustomButton";
import LoginIcon from "@mui/icons-material/Login";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerUser } from "../../api/userApi";
import SwitchButton from "../../components/SwitchButton";
import dioLogo from "../../assets/dio-logo.png";

// Department & Job Position types
interface DepartmentType {
  id: number;
  name: string;
}

interface JobPositionType {
  id: number;
  name: string;
}

function RegistrationForm() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up(990));
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  // Department & Job Position states 
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [jobPositions, setJobPositions] = useState<JobPositionType[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/payroll/departments")
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error("Error fetching departments:", err));

    axios
      .get("http://localhost:8000/api/payroll/job-positions")
      .then((res) => setJobPositions(res.data))
      .catch((err) => console.error("Error fetching job positions:", err));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm({
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
      mobileNumber: null,
      name: "",
      confirmPassword: "",
      isCompanyEmployee: false,
      jobPosition: "",
      department: "",
      employeeNumber: "",
    },
  });

  const isNotEmployee = watch("isCompanyEmployee");
  const userPassword = watch("password");

  const { mutate: registrationMutation, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      localStorage.setItem("token", data?.access_token);
      enqueueSnackbar("Account Created Successfully!", { variant: "success" });
      navigate("/home");
    },
    onError: (error: any) => {
      console.log(error);
      enqueueSnackbar(error?.data?.message ?? `Registration Failed`, {
        variant: "error",
      });
    },
  });

  const onRegistrationSubmit = (data) => {
    registrationMutation(data);
  };

  return (
    <Stack
      spacing={2}
      sx={{
        justifyContent: "center",
        margin: "2.5rem",
        marginBottom: isMdUp ? "2.5rem" : "22vh",
      }}
    >
      <Box>
        <img src={dioLogo} alt="DIO Logo" height={"110px"} />
        
      </Box>
      <Box>
        <Typography variant={"body2"}>
          Create an account to access the platform
        </Typography>
      </Box>
      <form onSubmit={handleSubmit(onRegistrationSubmit)}>
        <TextField
          required
          id="name"
          label="Name"
          error={!!errors.name}
          fullWidth
          size="small"
          sx={{ marginTop: "1rem" }}
          helperText={errors.name ? errors.name.message : ""}
          {...register("name", {
            required: {
              value: true,
              message: "Required",
            },
            pattern: {
              value: /^[a-zA-Z\s]+$/,
              message: "Name must contain only letters and spaces",
            },
          })}
        />

        <TextField
          required
          id="email"
          label="Email Address"
          placeholder="sample@company.com"
          error={!!errors.email}
          fullWidth
          type="email"
          size="small"
          sx={{ marginTop: "1rem" }}
          {...register("email", {
            required: {
              value: true,
              message: "Email is required",
            },
            minLength: {
              value: 5,
              message: "Email must be at least 5 characters long",
            },
            maxLength: {
              value: 320,
              message: "Email cannot exceed 320 characters long",
            },
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "Invalid email format",
            },
          })}
          helperText={errors.email ? errors.email.message : ""}
        />

        <TextField
          required
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          size="small"
          fullWidth
          sx={{ marginTop: "1rem" }}
          error={!!errors.password}
          {...register("password", {
            required: {
              value: true,
              message: "Password is required",
            },
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters long",
            },
            maxLength: {
              value: 128,
              message: "Password cannot exceed 128 characters long",
            },
          })}
          helperText={errors.password ? errors.password.message : ""}
        />

        <TextField
          required
          id="confirmPassword"
          label="Confirm Password"
          type={"password"}
          size="small"
          fullWidth
          helperText={
            errors.confirmPassword ? errors.confirmPassword.message : ""
          }
          sx={{ marginTop: "1rem" }}
          error={!!errors.confirmPassword}
          {...register("confirmPassword", {
            required: {
              value: true,
              message: "Confirm Password is required",
            },
            validate: {
              matchesPreviousPassword: (value) =>
                value === userPassword || "Passwords do not match",
            },
          })}
        />

        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                size="small"
              />
            }
            label="Show Password"
            sx={{
              "& .MuiTypography-body1": {
                fontSize: "0.85rem",
              },
              marginTop: "1rem",
            }}
          />
        </Box>

        <TextField
          required
          id="mobileNumber"
          label="Mobile Number"
          type="tel"
          error={!!errors.mobileNumber}
          fullWidth
          size="small"
          sx={{ marginTop: "1rem" }}
          helperText={
            typeof errors.mobileNumber?.message === "string"
              ? errors.mobileNumber.message
              : ""
          }
          {...register("mobileNumber", {
            required: {
              value: true,
              message: "Mobile number is required",
            },
            minLength: {
              value: 6,
              message: "Mobile number must be at least 6 digits",
            },
            maxLength: {
              value: 16,
              message: "Mobile number cannot exceed 16 digits",
            },
            pattern: {
              value: /^[0-9]+$/,
              message: "Enter a valid mobile number (digits only)",
            },
          })}
        />

        <Box sx={{ marginTop: "2rem" }}>
          <Controller
            control={control}
            name={"isCompanyEmployee"}
            render={({ field }) => {
              return (
                <SwitchButton
                  label="Is Company Employee"
                  onChange={field.onChange}
                  value={field.value}
                />
              );
            }}
          />
        </Box>

        {isNotEmployee ? (
          <Stack
            sx={{
              display: "flex",
            }}
          >
            <Controller
              control={control}
              name="department"
              rules={{ required: true }}
              render={({ field }) => (
                <Autocomplete
                  size="small"
                  options={departments}
                  getOptionLabel={(option) => option.name || ""}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_, value) => field.onChange(value ? value.name : "")}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      error={!!errors.department}
                      label="Department"
                      name="department"
                    />
                  )}
                />
              )}
            />

            <Controller
              control={control}
              name="jobPosition"
              rules={{ required: true }}
              render={({ field }) => (
                <Autocomplete
                  size="small"
                  options={jobPositions}
                  getOptionLabel={(option) => option.name || ""}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_, value) => field.onChange(value ? value.name : "")}
                  sx={{ marginTop: "1rem" }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      error={!!errors.jobPosition}
                      label="Job Position"
                      name="jobPosition"
                    />
                  )}
                />
              )}
            />

            <TextField
              required
              id="employeeNumber"
              label="Employee Number"
              error={!!errors.employeeNumber}
              size="small"
              sx={{ marginTop: "1rem" }}
              {...register("employeeNumber", {
                required: {
                  value: true,
                  message: "Employee Number is required",
                },
                pattern: {
                  value: /^[a-zA-Z0-9]+$/,
                  message:
                    "Employee Number must contain only letters and numbers",
                },
              })}
              helperText={
                errors.employeeNumber ? errors.employeeNumber.message : ""
              }
            />
          </Stack>
        ) : null}

        <Box
          sx={{
            marginTop: "1.6rem",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <CustomButton
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "var(--pallet-blue)",
            }}
            size="medium"
            disabled={isPending}
            startIcon={
              isPending ? (
                <CircularProgress color="inherit" size={"1rem"} />
              ) : (
                <LoginIcon />
              )
            }
          >
            Create Account
          </CustomButton>
          <CustomButton
            variant="text"
            sx={{
              color: "var(--pallet-orange)",
            }}
            size="medium"
            onClick={() => navigate("/")}
          >
            Login to an existing account
          </CustomButton>
        </Box>
      </form>
    </Stack>
  );
}

export default RegistrationForm;
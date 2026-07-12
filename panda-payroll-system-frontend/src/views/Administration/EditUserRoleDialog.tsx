import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import {
  Autocomplete,
  Box,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Controller, useForm } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect } from "react";
import CustomButton from "../../components/CustomButton";
import {
  fetchAllAssigneeLevel,
  User,
  UserLevel,
} from "../../api/userApi";
import { useQuery } from "@tanstack/react-query";
import { fetchDepartmentData } from "../../api/departmentApi";
import { fetchJobPositionData } from "../../api/jobPositionApi";
import SwitchButton from "../../components/SwitchButton";

type DialogProps = {
  open: boolean;
  handleClose: () => void;
  defaultValues?: User;
  onSubmit: (data: {
    id: number;
    name: string;
    assigneeLevel: string;
    department: string;
    availability: boolean;
    jobPosition: string;
  }) => void;
  isSubmitting?: boolean;
};

export default function EditUserRoleDialog({
  open,
  handleClose,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: DialogProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // User Level options (Admin, Team Member, Executive, Manager, CEO)
  const { data: levels } = useQuery<UserLevel[]>({
    queryKey: ["access-levels"],
    queryFn: fetchAllAssigneeLevel,
  });

  // Departments come from the Payroll System's "Departments & Positions" data
  const { data: departmentData, refetch: refetchDepartments } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartmentData,
  });

  // Job Positions come from the Payroll System's "Departments & Positions" data
  const { data: jobPositions, refetch: refetchJobPositions } = useQuery({
    queryKey: ["jobPositions"],
    queryFn: fetchJobPositionData,
  });

  useEffect(() => {
    if (open) {
      refetchDepartments();
      refetchJobPositions();
    }
  }, [open, refetchDepartments, refetchJobPositions]);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<User>({
    defaultValues: {
      name: defaultValues?.name ?? "",
      userLevel: defaultValues?.userLevel,
      department: defaultValues?.department ?? "",
      jobPosition: defaultValues?.jobPosition ?? "",
      availability: defaultValues?.availability ?? false,
    },
  });

  const isAvailability = watch("availability");

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    } else {
      reset();
    }
  }, [defaultValues, reset]);

  const resetForm = () => {
    reset();
  };

  // Shared style for the text/autocomplete fields so labels, input text,
  // and borders are all readable in both light and dark mode.
  const fieldSx = {
    flex: 1,
    margin: "0.5rem",
    "& .MuiInputBase-input": {
      color: isDarkMode ? "#ffffff" : "inherit",
    },
    "& .MuiInputLabel-root": {
      color: isDarkMode ? "#cbd5e1" : "inherit",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: isDarkMode ? "#2e3b63" : undefined,
    },
    "& .MuiSvgIcon-root": {
      color: isDarkMode ? "#cbd5e1" : "inherit",
    },
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        resetForm();
        handleClose();
      }}
      fullScreen={true}
      PaperProps={{
        style: {
          backgroundColor: isDarkMode ? "#0b1329" : "#fafafa",
          minWidth: "500px",
        },
        component: "form",
      }}
    >
      <DialogTitle
        sx={{
          paddingY: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: isDarkMode ? "#ffffff" : "inherit",
        }}
      >
        <Typography variant="h6" component="div">
          {defaultValues ? "Edit User Role" : "Add User Role"}
        </Typography>
        <IconButton
          aria-label="open drawer"
          onClick={handleClose}
          edge="start"
          sx={{
            color: isDarkMode ? "#90caf9" : "#024271",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider sx={{ backgroundColor: isDarkMode ? "#2e3b63" : undefined }} />
      <DialogContent>
        <Stack direction="column" gap={1}>
          <Box sx={{ "& span, & p": { color: isDarkMode ? "#ffffff" : "inherit" } }}>
            <Controller
              control={control}
              name={"availability"}
              render={({ field }) => {
                return (
                  <SwitchButton
                    label="Is User Available"
                    onChange={field.onChange}
                    value={field.value}
                  />
                );
              }}
            />
          </Box>

          {isAvailability ? (
            <>
              {/* Name field - replaces the old Role dropdown */}
              <Box sx={{ flex: 1 }}>
                <Controller
                  name="name"
                  control={control}
                  defaultValue={defaultValues?.name ?? ""}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      required
                      fullWidth
                      size="small"
                      error={!!errors.name}
                      helperText={errors.name && "Required"}
                      label="Name"
                      sx={fieldSx}
                    />
                  )}
                />
              </Box>

              {/* User Level dropdown: Admin, Team Member, Executive, Manager, CEO */}
              <Box sx={{ flex: 1 }}>
                <Controller
                  name="userLevel"
                  control={control}
                  defaultValue={defaultValues?.userLevel}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      onChange={(_, data) => field.onChange(data)}
                      getOptionLabel={(option) => option?.levelName || ""}
                      size="small"
                      options={levels || []}
                      sx={fieldSx}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {option.levelName}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.userLevel}
                          label="User Level"
                          name="userLevel"
                        />
                      )}
                    />
                  )}
                />
              </Box>

              {/* Department dropdown - populated from Payroll System data */}
              <Box sx={{ flex: 1 }}>
                <Controller
                  name="department"
                  control={control}
                  defaultValue={defaultValues?.department ?? ""}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      onChange={(event, newValue) => field.onChange(newValue)}
                      size="small"
                      options={
                        departmentData?.length
                          ? departmentData.map(
                              (department) => department.name
                            )
                          : []
                      }
                      sx={fieldSx}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.department}
                          helperText={errors.department && "Required"}
                          label="Department"
                          name="department"
                        />
                      )}
                    />
                  )}
                />
              </Box>

              {/* Job Position dropdown - populated from Payroll System data */}
              <Box sx={{ flex: 1 }}>
                <Controller
                  name="jobPosition"
                  control={control}
                  defaultValue={defaultValues?.jobPosition ?? ""}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      onChange={(event, newValue) => field.onChange(newValue)}
                      size="small"
                      options={
                        jobPositions?.length
                          ? jobPositions.map(
                              (jobPositions) => jobPositions.name
                            )
                          : []
                      }
                      sx={fieldSx}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.jobPosition}
                          helperText={errors.jobPosition && "Required"}
                          label="Job Position"
                          name="jobPosition"
                        />
                      )}
                    />
                  )}
                />
              </Box>
            </>
          ) : null}
        </Stack>
      </DialogContent>
      <Divider sx={{ backgroundColor: isDarkMode ? "#2e3b63" : undefined }} />
      <DialogActions sx={{ padding: "1rem" }}>
        <Button
          onClick={() => {
            resetForm();
            handleClose();
          }}
          sx={{ color: isDarkMode ? "#90caf9" : "var(--pallet-blue)" }}
        >
          Cancel
        </Button>
        <CustomButton
          variant="contained"
          sx={{
            backgroundColor: isDarkMode ? "#90caf9" : "var(--pallet-blue)",
            color: isDarkMode ? "#0b1329" : "#ffffff",
          }}
          disabled={isSubmitting}
          size="medium"
          onClick={handleSubmit((data) => {
            onSubmit({
              id: defaultValues?.id,
              name: data.name,
              assigneeLevel: data.userLevel?.id,
              department: data.department,
              availability: data.availability,
              jobPosition: data.jobPosition,
            });
          })}
        >
          {defaultValues ? "Update Changes" : "Assign Role"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
}
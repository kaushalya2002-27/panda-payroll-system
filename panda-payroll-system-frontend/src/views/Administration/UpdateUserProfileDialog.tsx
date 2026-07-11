import {
  Autocomplete,
  Box,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import CustomButton from "../../components/CustomButton";
import useIsMobile from "../../customHooks/useIsMobile";
import {
  updateUserProfileDetails,
  User,
} from "../../api/userApi";
import queryClient from "../../state/queryClient";
const genderOptions = ["Male", "Female", "Other"];

type DialogProps = {
  open: boolean;
  handleClose: () => void;
  defaultValues?: User;
};

export default function UpdateUserProfile({
  open,
  handleClose,
  defaultValues,
}: DialogProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const { enqueueSnackbar } = useSnackbar();
  const { isTablet } = useIsMobile();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    register,
    setValue,
  } = useForm<User>({
    defaultValues: {
      ...defaultValues,
    },
  });

  const isAvailability = watch("availability");

  const { mutate: profileUpdateMutation, isPending } = useMutation({
    mutationFn: updateUserProfileDetails,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      enqueueSnackbar("Profile updated successfully!", { variant: "success" });
      handleClose();
    },
    onError: () => {
      enqueueSnackbar("Profile update failed", { variant: "error" });
    },
  });

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

  const onSubmitForm = (data: User) => {
    profileUpdateMutation({
      id: data.id!,
      name: data.name!,
      gender: data.gender!,
      mobile: data.mobile,
    });
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
      fullWidth 
      PaperProps={{
        sx: {
          backgroundColor: isDarkMode ? "#0b1329" : "#fafafa",
          width: { xs: "92%", sm: "500px" },
          mx: "auto", 
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
          Update User Profile
        </Typography>
        <IconButton
          onClick={handleClose}
          edge="start"
          sx={{ color: isDarkMode ? "#90caf9" : "#024271" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider sx={{ backgroundColor: isDarkMode ? "#2e3b63" : undefined }} />
      <DialogContent>
        <Stack direction="column" gap={1}>
          {isAvailability && (
            <>
              <Box sx={{ display: "flex" }}>
                <TextField
                  id="name"
                  type="text"
                  label="Full Name"
                  required
                  error={!!errors.name}
                  helperText={errors.name ? "Required *" : ""}
                  size="small"
                  sx={fieldSx}
                  {...register("name", { required: true })}
                />
              </Box>

              <Box sx={{ display: "flex" }}>
                <TextField
                  id="mobile"
                  type="text"
                  label="Mobile Number"
                  required
                  error={!!errors.mobile}
                  helperText={errors.mobile ? "Required *" : ""}
                  size="small"
                  sx={fieldSx}
                  {...register("mobile", { required: true })}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Controller
                  control={control}
                  name="gender"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Autocomplete
                      options={genderOptions}
                      size="small"
                      sx={fieldSx}
                      value={field.value || null}
                      onChange={(_, value) => field.onChange(value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.gender}
                          label="Gender"
                          name="gender"
                        />
                      )}
                    />
                  )}
                />
              </Box>
            </>
          )}
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
          disabled={isPending}
          size="medium"
          onClick={handleSubmit(onSubmitForm)}
        >
          {defaultValues ? "Update Changes" : "Assign Role"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
}
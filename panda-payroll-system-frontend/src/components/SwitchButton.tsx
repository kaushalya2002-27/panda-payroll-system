import { Box, styled, Switch, SwitchProps, Typography, useTheme } from "@mui/material"; // 👈 මෙතනට useTheme එකතු කළා

const CustomSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 52, 
  height: 32, 
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 4,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(20px)", 
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.primary.main, 
        opacity: 1,
        border: 0,
        ...theme.applyStyles("dark", {
          backgroundColor: "#2ECA45",
        }),
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
      boxShadow: `0 0 0 4px ${theme.palette.primary.light}`, 
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.grey[100],
      ...theme.applyStyles("dark", {
        color: theme.palette.grey[600],
      }),
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.7,
      ...theme.applyStyles("dark", {
        opacity: 0.3,
      }),
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 24, 
    height: 24, 
    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.2)", 
  },
  "& .MuiSwitch-track": {
    borderRadius: 32 / 2,
    backgroundColor: "#A0A0A0", 
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
    ...theme.applyStyles("dark", {
      backgroundColor: "#39393D",
    }),
  },
}));

function SwitchButton({
  value,
  onChange,
  label,
  disabled = false,
  ariaLabel,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const theme = useTheme(); 
  const switchId = `switch-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center", 
        marginY: "0.75rem",
      }}
    >
      <CustomSwitch
        id={switchId}
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        aria-label={ariaLabel || label}
        inputProps={{ 'aria-labelledby': `${switchId}-label` }}
      />
      <Typography
        variant="body1"
        id={`${switchId}-label`}
        sx={{
          color: disabled ? "text.disabled" : "text.primary", 
          marginBottom: 0,
          marginLeft: "0.75rem",
          fontWeight: 500, 
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default SwitchButton;
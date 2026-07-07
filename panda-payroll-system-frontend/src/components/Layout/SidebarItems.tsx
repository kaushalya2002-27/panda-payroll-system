import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import KeyIcon from "@mui/icons-material/Key";
import { PermissionKeys } from "../../views/Administration/SectionList";

export interface SidebarItem {
  title?: string;
  headline?: string;
  icon?: JSX.Element;
  open?: boolean;
  href?: string;
  disabled?: boolean;
  accessKey?: string;
  nestedItems?: {
    title: string;
    href: string;
    icon: JSX.Element;
    accessKey?: string;
    open?: boolean;
    disabled?: boolean;
    nestedItems?: {
      accessKey?: string;
      title: string;
      href: string;
      icon: JSX.Element;
      disabled?: boolean;
    }[];
  }[];
}

export const sidebarItems: Array<SidebarItem> = [
  {
    headline: "Main",
  },
  {
    title: "Insight",
    href: "/home",
    icon: <HomeIcon fontSize="small" />,
    accessKey: PermissionKeys.INSIGHT_VIEW,
  },
  {
    headline: "Administration",
  },
  {
    title: "Users",
    icon: <PeopleAltIcon fontSize="small" />,
    href: "/admin/users",
    accessKey: PermissionKeys.ADMIN_USERS_VIEW,
  },
  {
    title: "Access Management",
    icon: <KeyIcon fontSize="small" />,
    href: "/admin/access-management",
    accessKey: PermissionKeys.ADMIN_ACCESS_MNG_VIEW,
  },

  // PAYROLL SYSTEM MODULE
  {
    headline: "Payroll System",
  },
  {
    title: "Dashboard",
    href: "/payroll/dashboard",
    icon: <SubdirectoryArrowRightIcon fontSize="small" />,
    accessKey: PermissionKeys.PAYROLL_DASHBOARD_VIEW,
  },
  {
    title: "All Employees",
    href: "/payroll/employees",
    icon: <SubdirectoryArrowRightIcon fontSize="small" />,
    accessKey: PermissionKeys.PAYROLL_ALL_EMPLOYEES_VIEW,
  },
  {
    title: "Add Employee",
    href: "/payroll/add-employee",
    icon: <SubdirectoryArrowRightIcon fontSize="small" />,
    accessKey: PermissionKeys.PAYROLL_ADD_EMPLOYEE_VIEW,
  },
  {
    title: "Time Cards ",
    href: "/payroll/time-cards",
    icon: <SubdirectoryArrowRightIcon fontSize="small" />,
    accessKey: PermissionKeys.PAYROLL_TIME_CARDS_VIEW,
  },
  {
    title: "Monthly Summary",
    href: "/payroll/summary",
    icon: <SubdirectoryArrowRightIcon fontSize="small" />,
    accessKey: PermissionKeys.PAYROLL_MONTHLY_SUMMARY_VIEW,
  },
  {
    title: "Pay Slips",
    href: "/payroll/slips",
    icon: <SubdirectoryArrowRightIcon fontSize="small" />,
    accessKey: PermissionKeys.PAYROLL_PAY_SLIPS_VIEW,
  },
  {
    title: "Detail Sheets",
    href: "/payroll/detail-sheets",
    icon: <SubdirectoryArrowRightIcon fontSize="small" />,
    accessKey: PermissionKeys.PAYROLL_DETAIL_SHEETS_VIEW,
  },
  {
    title: "Products & Rates",
    href: "/payroll/rates",
    icon: <SubdirectoryArrowRightIcon fontSize="small" />,
    accessKey: PermissionKeys.PAYROLL_PRODUCTS_RATES_VIEW,
  },
  {
    title: "Departments & Positions",
    href: "/payroll/departments",
    icon: <SubdirectoryArrowRightIcon fontSize="small" />,
    accessKey: PermissionKeys.PAYROLL_DEPARTMENTS_POSITIONS_VIEW,
  },
];
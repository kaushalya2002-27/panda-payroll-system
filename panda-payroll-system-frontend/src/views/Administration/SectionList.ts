import { z } from "zod";

export const PermissionSectionsMap: PermissionSection[] = [
  {
    mainSection: "Main",
    subSections: [
      {
        name: "Insight",
        key: "INSIGHT",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
        },
      },
    ],
  },
  {
    mainSection: "Administration",
    subSections: [
      {
        name: "Administration > Users",
        key: "ADMIN_USERS",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: true,
          DELETE: true,
        },
      },
      {
        name: "Administration > Access Management",
        key: "ADMIN_ACCESS_MNG",
        permissionsExists: {
          VIEW: true,
          CREATE: true,
          EDIT: true,
          DELETE: true,
        },
      },
    ],
  },
  {
    mainSection: "Payroll System",
    subSections: [
      {
        name: "Dashboard",
        key: "PAYROLL_DASHBOARD",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
        },
      },
      {
        name: "All Employees",
        key: "PAYROLL_ALL_EMPLOYEES",
        permissionsExists: {
          VIEW: true,
          CREATE: true,
          EDIT: true,
          DELETE: false,
        },
      },     
      {
        name: "Time Cards",
        key: "PAYROLL_TIME_CARDS",
        permissionsExists: {
          VIEW: true,
          CREATE: true,
          EDIT: true,
          DELETE: false,
        },
      },
      {
        name: "Monthly Summary",
        key: "PAYROLL_MONTHLY_SUMMARY",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
        },
      },
      {
        name: "Pay Slips",
        key: "PAYROLL_PAY_SLIPS",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
        },
      },
      {
        name: "Detail Sheets",
        key: "PAYROLL_DETAIL_SHEETS",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
        },
      },
      {
        name: "Products & Rates",
        key: "PAYROLL_PRODUCTS_RATES",
        permissionsExists: {
          VIEW: true,
          CREATE: true,
          EDIT: true,
          DELETE: true,
        },
      },
      {
        name: "Departments",
        key: "PAYROLL_DEPARTMENTS",
        permissionsExists: {
          VIEW: true,
          CREATE: true,
          EDIT: true,
          DELETE: true,
        },
      },
      {
        name: "Job Positions",
        key: "PAYROLL_JOB_POSITIONS",
        permissionsExists: {
          VIEW: true,
          CREATE: true,
          EDIT: true,
          DELETE: true,
        },
      },
    ],
  },
];

export interface PermissionSection {
  mainSection: string;
  subSections: SubSection[];
}

export interface SubSectionWithPermissions {
  name: string;
  key: string;
  permissionsExists: PermissionsExists;
}

export interface SubSectionBreak {
  break: boolean;
  name: string;
}

export type SubSection = SubSectionWithPermissions | SubSectionBreak;

export interface PermissionsExists {
  VIEW: boolean;
  CREATE: boolean;
  EDIT: boolean;
  DELETE: boolean;
}

export enum PermissionKeys {
  // Insight
  INSIGHT_VIEW = "INSIGHT_VIEW",
  // Administration
  ADMIN_USERS_VIEW = "ADMIN_USERS_VIEW",
  ADMIN_USERS_EDIT = "ADMIN_USERS_EDIT",
  ADMIN_USERS_DELETE = "ADMIN_USERS_DELETE",
  ADMIN_ACCESS_MNG_VIEW = "ADMIN_ACCESS_MNG_VIEW",
  ADMIN_ACCESS_MNG_CREATE = "ADMIN_ACCESS_MNG_CREATE",
  ADMIN_ACCESS_MNG_EDIT = "ADMIN_ACCESS_MNG_EDIT",
  ADMIN_ACCESS_MNG_DELETE = "ADMIN_ACCESS_MNG_DELETE",
  // Payroll System
  PAYROLL_DASHBOARD_VIEW = "PAYROLL_DASHBOARD_VIEW",
  PAYROLL_ALL_EMPLOYEES_VIEW = "PAYROLL_ALL_EMPLOYEES_VIEW",
  PAYROLL_ALL_EMPLOYEES_EDIT = "PAYROLL_ALL_EMPLOYEES_EDIT",
  PAYROLL_ALL_EMPLOYEES_DELETE = "PAYROLL_ALL_EMPLOYEES_DELETE",
  PAYROLL_ALL_EMPLOYEES_CREATE = "PAYROLL_ALL_EMPLOYEES_CREATE",
  PAYROLL_ADD_EMPLOYEE_VIEW = "PAYROLL_ADD_EMPLOYEE_VIEW",
  PAYROLL_ADD_EMPLOYEE_CREATE = "PAYROLL_ADD_EMPLOYEE_CREATE",
  PAYROLL_TIME_CARDS_VIEW = "PAYROLL_TIME_CARDS_VIEW",
  PAYROLL_TIME_CARDS_CREATE = "PAYROLL_TIME_CARDS_CREATE",
  PAYROLL_TIME_CARDS_EDIT = "PAYROLL_TIME_CARDS_EDIT",
  PAYROLL_MONTHLY_SUMMARY_VIEW = "PAYROLL_MONTHLY_SUMMARY_VIEW",
  PAYROLL_PAY_SLIPS_VIEW = "PAYROLL_PAY_SLIPS_VIEW",
  PAYROLL_DETAIL_SHEETS_VIEW = "PAYROLL_DETAIL_SHEETS_VIEW",
  PAYROLL_PRODUCTS_RATES_VIEW = "PAYROLL_PRODUCTS_RATES_VIEW",
  PAYROLL_PRODUCTS_RATES_CREATE = "PAYROLL_PRODUCTS_RATES_CREATE",
  PAYROLL_PRODUCTS_RATES_EDIT = "PAYROLL_PRODUCTS_RATES_EDIT",
  PAYROLL_PRODUCTS_RATES_DELETE = "PAYROLL_PRODUCTS_RATES_DELETE",
  PAYROLL_DEPARTMENTS_VIEW = "PAYROLL_DEPARTMENTS_VIEW",
  PAYROLL_DEPARTMENTS_CREATE = "PAYROLL_DEPARTMENTS_CREATE",
  PAYROLL_DEPARTMENTS_EDIT = "PAYROLL_DEPARTMENTS_EDIT",
  PAYROLL_DEPARTMENTS_DELETE = "PAYROLL_DEPARTMENTS_DELETE",
  PAYROLL_JOB_POSITIONS_VIEW = "PAYROLL_JOB_POSITIONS_VIEW",
  PAYROLL_JOB_POSITIONS_CREATE = "PAYROLL_JOB_POSITIONS_CREATE",
  PAYROLL_JOB_POSITIONS_EDIT = "PAYROLL_JOB_POSITIONS_EDIT",
  PAYROLL_JOB_POSITIONS_DELETE = "PAYROLL_JOB_POSITIONS_DELETE",
}

// Create the Zod schema using the enum values
export const PermissionKeysObjectSchema = z.object(
  Object.values(PermissionKeys).reduce((acc, key) => {
    acc[key] = z.boolean();
    return acc;
  }, {} as Record<PermissionKeys, z.ZodBoolean>)
);

// Infer the TypeScript type from the Zod schema
export type PermissionKeysObject = z.infer<typeof PermissionKeysObjectSchema>;

// Super Admin — full access to everything
export const defaultAdminPermissions = Object.values(PermissionKeys).reduce(
  (acc, key) => {
    acc[key] = true;
    return acc;
  },
  {} as Record<PermissionKeys, boolean>
);

// Newly registered / "Give Access" default — Insight page witharai
export const defaultNewUserPermissions: PermissionKeysObject =
  Object.values(PermissionKeys).reduce((acc, key) => {
    acc[key] = key === PermissionKeys.INSIGHT_VIEW;
    return acc;
  }, {} as PermissionKeysObject);
import React, { Suspense, useMemo } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router";
import MainLayout from "./components/Layout/MainLayout";
import PageLoader from "./components/PageLoader";
import useCurrentUser from "./hooks/useCurrentUser";
import { PermissionKeys } from "./views/Administration/SectionList";
import PermissionDenied from "./components/PermissionDenied";
import { useQuery } from "@tanstack/react-query";
import { User, validateUser } from "./api/userApi";
import EditEmployee from "./views/Payroll/EditEmployee";
import ViewEmployee from "./views/Payroll/ViewEmployee";

// Payroll System Pages 
const PayrollDashboard = React.lazy(() => import("./views/Payroll/PayrolDashboard"));
const AllEmployees = React.lazy(() => import("./views/Payroll/AllEmployees"));
const AddEmployee = React.lazy(() => import("./views/Payroll/AddEmployee"));
const TimeCards = React.lazy(() => import("./views/Payroll/TimeCards"));
const MonthlySummary = React.lazy(() => import("./views/Payroll/MonthlySummary"));
const PaySlips = React.lazy(() => import("./views/Payroll/PaySlips"));
const DetailSheets = React.lazy(() => import("./views/Payroll/DetailSheets"));
const ProductsAndRates = React.lazy(() => import("./views/Payroll/ProductsAndRates"));
const PayrollDepartments = React.lazy(() => import("./views/Payroll/Departments"));

//Login Page
const LoginPage = React.lazy(() => import("./views/LoginPage/LoginPage"));

//Register Page
const RegistrationPage = React.lazy(
  () => import("./views/RegistrationPage/RegistrationPage")
);

//Insight Page
const InsightsPage = React.lazy(() => import("./views/Insights/Insight"));

//Administration (User Management)
const UserTable = React.lazy(() => import("./views/Administration/UserTable"));
const AccessManagementTable = React.lazy(
  () => import("./views/Administration/AccessManagementTable")
);

function withLayout(Layout: any, Component: any, restrictAccess = false) {
  return (
    <Layout>
      <Suspense
        fallback={
          <>
            <PageLoader />
          </>
        }
      >
        {restrictAccess ? <PermissionDenied /> : <Component />}
      </Suspense>
    </Layout>
  );
}

function withoutLayout(Component: React.LazyExoticComponent<any>) {
  return (
    <Suspense
      fallback={
        <>
          <PageLoader />
        </>
      }
    >
      <Component />
    </Suspense>
  );
}

const ProtectedRoute = () => {
  const { user, status } = useCurrentUser();

  if (status === "loading" || status === "idle" || status === "pending") {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

const AppRoutes = () => {
  const { data: user, status } = useQuery<User>({
    queryKey: ["current-user"],
    queryFn: validateUser,
  });

  const userPermissionObject = useMemo(() => {
    if (user && user?.permissionObject) {
      return user?.permissionObject;
    }
  }, [user]);

  return (
    <Routes>
      {/* Auth Pages */}
      <Route path="/" element={withoutLayout(LoginPage)} />
      <Route path="/register" element={withoutLayout(RegistrationPage)} />
      
      <Route element={<ProtectedRoute />}>
        {/* Insight */}
        <Route
          path="/home"
          element={withLayout(
            MainLayout,
            InsightsPage,
            !userPermissionObject?.[PermissionKeys.INSIGHT_VIEW]
          )}
        />

        {/* Admin Controller (User Management) */}
        <Route
          path="/admin/users"
          element={withLayout(
            MainLayout,
            UserTable,
            !userPermissionObject?.[PermissionKeys.INSIGHT_VIEW]
          )}
        />
        <Route
          path="/admin/access-management"
          element={withLayout(
            MainLayout,
            AccessManagementTable,
            !userPermissionObject?.[PermissionKeys.ADMIN_USERS_VIEW]
          )}
        />

        {/* Payroll System Module */}
        <Route
          path="/payroll/dashboard"
          element={withLayout(
            MainLayout,
            PayrollDashboard,
            false 
          )}
        />
        <Route
          path="/payroll/employees"
          element={withLayout(
            MainLayout,
            AllEmployees,
            false
          )}
        />
        <Route
          path="/payroll/employees/:id"
          element={withLayout(
            MainLayout,
            ViewEmployee,
            false
          )}
        />
        <Route
          path="/payroll/employees/:id/edit"
          element={withLayout(
            MainLayout,
            EditEmployee,
            false
          )}
        />
        <Route
          path="/payroll/add-employee"
          element={withLayout(
            MainLayout,
            AddEmployee,
            false
          )}
        />
        <Route
          path="/payroll/time-cards"
          element={withLayout(
            MainLayout,
            TimeCards,
            false
          )}
        />
        <Route
          path="/payroll/summary"
          element={withLayout(
            MainLayout,
            MonthlySummary,
            false
          )}
        />
        <Route
          path="/payroll/slips"
          element={withLayout(
            MainLayout,
            PaySlips,
            false
          )}
        />
        <Route
          path="/payroll/detail-sheets"
          element={withLayout(
            MainLayout,
            DetailSheets,
            false
          )}
        />
        <Route
          path="/payroll/rates"
          element={withLayout(
            MainLayout,
            ProductsAndRates,
            false
          )}
        />
        <Route
          path="/payroll/departments"
          element={withLayout(
            MainLayout,
            PayrollDepartments,
            false
          )}
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
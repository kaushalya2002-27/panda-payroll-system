<?php

use App\Http\Controllers\AdminControllers\AdminController;
use App\Http\Controllers\api\CalculationController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\CommonControllers\ComPermissionController;
use App\Http\Controllers\CommonControllers\DepartmentController;
use App\Http\Controllers\CommonControllers\FactoryController;
use App\Http\Controllers\CommonControllers\JobPositionController;
use App\Http\Controllers\CommonControllers\PersonTypeController;
use App\Http\Controllers\CommonControllers\UserTypeController;
use App\Http\Controllers\Payroll\DashboardController;
use App\Http\Controllers\Payroll\DepartmentsController;
use App\Http\Controllers\Payroll\DetailSheetController;
use App\Http\Controllers\Payroll\EmployeeController;
use App\Http\Controllers\Payroll\PayrollController;
use App\Http\Controllers\Payroll\PayrollJobPositionController;
use App\Http\Controllers\Payroll\PayrollProductController;
use App\Http\Controllers\Payroll\PayrollSummaryController;
use App\Http\Controllers\Payroll\PaySlipController;
use App\Http\Controllers\Payroll\TimecardController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
| Public Routes (Authentication & Basic Configurations)
*/
Route::post('calculate', [CalculationController::class, 'store']);
Route::post('register', [RegisteredUserController::class, 'store']);
Route::post('login', [LoginController::class, 'login']);
Route::post('forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail']);
Route::post('reset-password', [ForgotPasswordController::class, 'otpVerifyFunction']);
Route::post('change-password', [ForgotPasswordController::class, 'changePassword']);



/*
| Protected Routes (Authenticated via Sanctum)
*/
Route::middleware('auth:sanctum')->group(function () {
    // Current User & Logout
    Route::get('user', [UserController::class, 'show']);
    Route::post('logout', [LogoutController::class, 'logout']);

    // User Profile & Account Settings
    Route::get('users-assignee', [UserController::class, 'assignee']);
    Route::post('user-change-password', [UserController::class, 'changePassword']);
    Route::post('user/{id}/profile-update', [UserController::class, 'profileUpdate']);
    Route::post('user/{id}/email-change', [UserController::class, 'emailChangeInitiate']);
    Route::post('user/{id}/email-change-verify', [UserController::class, 'emailChangeVerify']);
    Route::post('user/{id}/email-change-confirm', [UserController::class, 'emailChangeConfirm']);

    // User Management (Admin Panel)
    Route::get('users', [AdminController::class, 'index']);
    Route::post('users/{id}/update', [AdminController::class, 'update']);
    Route::get('users-assignee-level', [AdminController::class, 'assigneeLevel']);
    Route::post('users/{id}/give-access', [AdminController::class, 'giveAccess']);
    Route::get('all-users', [UserController::class, 'index']);
    Route::get('users/search', [UserController::class, 'search']);

    /*
     Payroll & Time Cards Module (Protected)
    */
    Route::apiResource('payroll-products', PayrollProductController::class);
    Route::post('/payroll/calculate', [PayrollController::class, 'calculateMonthlySalary']);

    // Payroll Summary API Routes
    Route::get('/payroll/summary', [PayrollSummaryController::class, 'index']);
    Route::post('/payroll/summary/recompute', [PayrollSummaryController::class, 'recompute']);

    //Payslip page
    Route::get('/payroll/pay-slip', [PaySlipController::class, 'getPaySlipData']);

    // Employees Management
    Route::get('/payroll/employees/next-code', [EmployeeController::class, 'getNextCode']);
    Route::get('/payroll/employees', [EmployeeController::class, 'index']);
    Route::post('/payroll/employees', [EmployeeController::class, 'store']);
    Route::get('/payroll/employees/{id}', [EmployeeController::class, 'show']);
    Route::match(['post', 'put'], '/payroll/employees/{id}', [EmployeeController::class, 'update']);

    // Departments Management
    Route::post('/payroll/departments', [DepartmentsController::class, 'store']);
    Route::put('/payroll/departments/{id}', [DepartmentsController::class, 'update']);
    Route::delete('/payroll/departments/{id}', [DepartmentsController::class, 'destroy']);

    // Job Positions Management
    Route::post('/payroll/job-positions', [PayrollJobPositionController::class, 'store']);
    Route::put('/payroll/job-positions/{id}', [PayrollJobPositionController::class, 'update']);
    Route::delete('/payroll/job-positions/{id}', [PayrollJobPositionController::class, 'destroy']);

    // Dashboard
    Route::get('/payroll/dashboard', [DashboardController::class, 'getDashboardData']);

    // Detail Sheet API Route
    Route::post('/timecard/detail-sheet', [DetailSheetController::class, 'getDetailSheet']);
});

Route::get('/payroll/departments', [DepartmentsController::class, 'index']);
Route::get('/payroll/job-positions', [PayrollJobPositionController::class, 'index']);
/*
| Common System Configurations & Permissions (Public/Common)
*/

// Time Cards API Routes
Route::post('/timecard/load', [TimecardController::class, 'loadTimecard']);
Route::post('/timecard/save', [TimecardController::class, 'saveTimecard']);
Route::get('/timecard/employees', [TimecardController::class, 'getEmployees']);
Route::get('/timecard/products', [TimecardController::class, 'getProducts']);


Route::get('user-permissions', [ComPermissionController::class, 'index']);
Route::post('user-permissions', [ComPermissionController::class, 'store']);
Route::get('user-permissions/{id}/show', [ComPermissionController::class, 'show']);
Route::post('user-permissions/{id}/update', [ComPermissionController::class, 'update']);
Route::delete('user-permissions/{id}/delete', [ComPermissionController::class, 'destroy']);

Route::get('job-positions', [JobPositionController::class, 'index']);
Route::post('job-positions', [JobPositionController::class, 'store']);
Route::get('user-types', [UserTypeController::class, 'index']);
Route::post('user-types', [UserTypeController::class, 'store']);
Route::post('departments', [DepartmentController::class, 'store']);
Route::get('departments', [DepartmentController::class, 'index']);
Route::get('factory', [FactoryController::class, 'show']);
Route::post('factory', [FactoryController::class, 'store']);
Route::get('person-types', [PersonTypeController::class, 'index']);
Route::post('person-types', [PersonTypeController::class, 'store']);

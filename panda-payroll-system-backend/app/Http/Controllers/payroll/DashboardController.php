<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Department;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getDashboardData()
    {
        $activeEmployeesCount = Employee::where('is_active', 1)->count();

        $departmentsCount = Department::count();

        $now = Carbon::now();
        $currentMonthText = $now->format('M Y');
        $currentMonthNum = $now->format('m');

        $totalPayrollSum = \App\Models\PayrollSummary::where('payroll_year', $now->year)
            ->where('payroll_month', $currentMonthNum)
            ->sum('gross_pay');

        $formattedPayroll = 'Rs. ' . number_format($totalPayrollSum, 2);

        $recentEmployees = Employee::where('is_active', 1)
            ->orderBy('id', 'desc')
            ->take(5)
            ->get()
            ->map(function ($emp) {
                return [
                    'name' => $emp->full_name,
                    'code' => $emp->emp_code,
                    'dept' => $emp->department ? $emp->department->name : 'Production',
                    'joined' => $emp->join_date ? Carbon::parse($emp->join_date)->format('d M Y') : 'N/A',
                    'avatar' => $emp->full_name ? strtoupper(substr($emp->full_name, 0, 1)) : 'E',
                    'photo' => $emp->photo
                ];
            });

        return response()->json([
            'success' => true,
            'cards' => [
                'active_employees' => $activeEmployeesCount,
                'departments' => $departmentsCount,
                'current_month' => $currentMonthText,
                'total_payroll' => $formattedPayroll
            ],
            'recent_employees' => $recentEmployees
        ]);
    }
}

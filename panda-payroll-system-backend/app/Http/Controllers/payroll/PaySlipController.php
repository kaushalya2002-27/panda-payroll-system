<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\PayrollSummary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PaySlipController extends Controller
{
    public function getPaySlipData(Request $request)
    {
        $employeeId = $request->query('employee_id');
        $year = $request->query('year');
        $month = $request->query('month');

        if (!$employeeId || !$year || !$month) {
            return response()->json([
                'success' => false,
                'message' => 'Required parameters missing.'
            ], 400);
        }

        $monthNumber = is_numeric($month) ? (int)$month : (int)date('m', strtotime("1 $month"));
        $formattedMonth = sprintf('%02d', $monthNumber);

        // Fetch Employee
        $employee = Employee::with('department')->find($employeeId);
        if (!$employee) {
            return response()->json(['success' => false, 'message' => 'Employee not found.'], 404);
        }

        // Fetch Payroll Summary
        $summary = PayrollSummary::where('employee_id', $employeeId)
            ->where('payroll_year', $year)
            ->where(function($query) use ($monthNumber, $formattedMonth) {
                $query->where('payroll_month', $monthNumber)
                      ->orWhere('payroll_month', $formattedMonth);
            })
            ->first();

        $productBreakdown = DB::table('timecard_products')
            ->join('timecards', 'timecard_products.timecard_id', '=', 'timecards.id')
            ->join('payroll_products', 'timecard_products.product_id', '=', 'payroll_products.id')
            ->where('timecards.employee_id', $employeeId)
            ->whereYear('timecards.work_date', $year)
            ->whereMonth('timecards.work_date', $formattedMonth)
            ->select('payroll_products.product_name', DB::raw('SUM(timecard_products.quantity) as total_units'))
            ->groupBy('payroll_products.id', 'payroll_products.product_name')
            ->get();

        // Calculate Days Worked & Leave
        $timecards = DB::table('timecards')
            ->where('employee_id', $employeeId)
            ->whereYear('work_date', $year)
            ->whereMonth('work_date', $formattedMonth)
            ->get();

        $daysWorked = 0;
        $daysLeave = 0;
        foreach ($timecards as $card) {
            $status = strtolower(trim($card->status ?? 'work'));
            $dayOfWeek = Carbon::parse($card->work_date)->dayOfWeek;

            if ($status === 'leave') {
                $daysLeave++;
            } elseif (($status === 'work' || $status === 'holiday') && $dayOfWeek !== 0) {
                $daysWorked++;
            }
        }

        return response()->json([
            'success' => true,
            'employee' => [
                'name' => $employee->full_name,
                'code' => $employee->emp_code,
                'department' => $employee->department->name ?? 'Production',
                'designation' => $employee->designation ?? 'Worker',
                'nic' => $employee->nic ?? 'N/A'
            ],
            'period' => [
                'month_year' => "$month $year",
                'days_worked' => $daysWorked,
                'days_leave' => $daysLeave,
            ],
            'products' => $productBreakdown,
            'earnings' => [
                'production_allowance' => $summary ? (float)$summary->total_production : 0.00,
                'overtime_allowance'   => $summary ? (float)$summary->total_ot : 0.00,
                'day_duty_allowance'   => $summary ? (float)$summary->total_day_duty : 0.00,
                'travelling_allowance' => $summary ? (float)$summary->total_travelling : 0.00,
                'other_allowances'     => $summary ? (float)$summary->total_other : 0.00,
                'gross_pay'            => $summary ? (float)$summary->gross_pay : 0.00,
            ]
        ]);
    }
}

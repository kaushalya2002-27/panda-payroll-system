<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\PayrollSummary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PayrollSummaryController extends Controller
{
    /**
     * Get Monthly Payroll Summary data.
     */
    public function index(Request $request)
    {
        $year = $request->query('year');
        $month = $request->query('month');

        $monthNumber = is_numeric($month) ? sprintf('%02d', $month) : date('m', strtotime("1 $month"));

        $allEmployees = Employee::with('department')->where('is_active', 1)->get();

        $existingSummaries = PayrollSummary::where('payroll_year', $year)
            ->where('payroll_month', (int)$monthNumber)
            ->get()
            ->keyBy('employee_id');

        $daysInMonth = Carbon::createFromDate((int)$year, (int)$monthNumber, 1)->daysInMonth;

        $finalData = [];

        foreach ($allEmployees as $employee) {
            $summary = $existingSummaries->get($employee->id);

            $timecards = DB::table('timecards')
                ->where('employee_id', $employee->id)
                ->whereYear('work_date', $year)
                ->whereMonth('work_date', $monthNumber)
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

            $prodPay = $summary ? (float)$summary->total_production : 0.00;
            $dayDuty = $summary ? (float)$summary->total_day_duty : 0.00;
            $travel  = $summary ? (float)$summary->total_travelling : 0.00;
            $other   = $summary ? (float)$summary->total_other : 0.00;
            $otValue = $summary ? (float)$summary->total_ot : 0.00;

            $grossPay = $prodPay + $otValue + $dayDuty + $travel + $other;

            $finalData[] = [
                'employee' => [
                    'id' => $employee->id,
                    'full_name' => $employee->full_name,
                    'emp_code' => $employee->emp_code,
                    'department' => ['name' => $employee->department->name ?? 'Production']
                ],
                'days_worked'      => $daysWorked,
                'days_leave'       => $daysLeave,
                'total_production' => $prodPay,
                'total_ot'         => $otValue,
                'total_day_duty'   => $dayDuty,
                'total_travelling' => $travel,
                'total_other'      => $other,
                'gross_pay'        => $grossPay,
                'is_locked'        => $summary ? (bool)$summary->is_locked : false,
            ];
        }

        $summariesCollection = collect($finalData);

        $totalProduction = $summariesCollection->sum('total_production');
        $totalDayDuty    = $summariesCollection->sum('total_day_duty');
        $totalTravelling = $summariesCollection->sum('total_travelling');
        $totalOther      = $summariesCollection->sum('total_other');
        $totalGross      = $summariesCollection->sum('gross_pay');
        $totalAllowances = $summariesCollection->sum('total_ot') + $totalDayDuty + $totalTravelling + $totalOther;

        $totals = [
            'days'             => $summariesCollection->sum('days_worked'),
            'leaves'           => $summariesCollection->sum('days_leave'),
            'prod_pay'         => $totalProduction,
            'ot'               => $summariesCollection->sum('total_ot'),
            'day_duty'         => $totalDayDuty,
            'travel'           => $totalTravelling,
            'other'            => $totalOther,
            'total_allowances' => $totalAllowances,
            'gross'            => $totalGross,
        ];

        return response()->json([
            'success' => true,
            'data'    => $finalData,
            'totals'  => $totals
        ]);
    }

    /**
     * Recompute payroll for all active employees.
     */
    public function recompute(Request $request)
    {
        $request->validate([
            'year' => 'required',
            'month' => 'required'
        ]);

        $year = $request->input('year');
        $month = $request->input('month');
        $monthNumber = is_numeric($month) ? (int)$month : (int)date('m', strtotime("1 $month"));

        try {
            $employees = Employee::where('is_active', 1)->get();
            $payrollController = new \App\Http\Controllers\Payroll\PayrollController();

            foreach ($employees as $employee) {
                $fakeRequest = new Request([
                    'employee_id' => $employee->id,
                    'year'        => (int)$year,
                    'month'       => $monthNumber
                ]);

                $payrollController->calculateMonthlySalary($fakeRequest);
            }

            return response()->json([
                'success' => true,
                'message' => 'Payroll recomputed successfully for all active employees.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error during recomputation: ' . $e->getMessage()
            ], 500);
        }
    }


    public function exportAllDetails(Request $request)
    {
        $year = $request->query('year');
        $month = $request->query('month');
        $monthNumber = is_numeric($month) ? sprintf('%02d', $month) : date('m', strtotime("1 $month"));

        $employees = \App\Models\Employee::where('is_active', 1)->get();

        $exportData = [];

        foreach ($employees as $employee) {
            $timecards = \DB::table('timecards')
                ->where('employee_id', $employee->id)
                ->whereYear('work_date', $year)
                ->whereMonth('work_date', $monthNumber)
                ->orderBy('work_date', 'asc')
                ->get();

            $dailyRecords = [];
            foreach ($timecards as $card) {
                $dailyRecords[] = [
                    'date'        => $card->work_date,
                    'status'      => $card->status ?? 'Work',
                    'prod_pay'    => $card->production_pay ?? 0.00,
                    'ot_hours'    => $card->ot_hours ?? 0.0,
                    'ot_earning'  => $card->ot_amount ?? 0.00,
                    'day_duty'    => $card->day_duty_allowance ?? 0.00,
                    'travelling'  => $card->travelling_allowance ?? 0.00,
                    'other'       => $card->other_allowance ?? 0.00,
                ];
            }

            $exportData[] = [
                'emp_code'  => $employee->emp_code,
                'full_name' => $employee->full_name,
                'records'   => $dailyRecords
            ];
        }

        return response()->json([
            'success'   => true,
            'year'      => $year,
            'month'     => $month,
            'employees' => $exportData
        ]);
    }
}

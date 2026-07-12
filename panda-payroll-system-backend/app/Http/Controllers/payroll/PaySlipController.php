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

        // Fetch active products with their rates
        $products = DB::table('payroll_products')->where('status', 'active')->orderBy('sort_order')->get();

        $productBreakdown = DB::table('timecard_products')
            ->join('timecards', 'timecard_products.timecard_id', '=', 'timecards.id')
            ->join('payroll_products', 'timecard_products.product_id', '=', 'payroll_products.id')
            ->where('timecards.employee_id', $employeeId)
            ->whereYear('timecards.work_date', $year)
            ->whereMonth('timecards.work_date', $formattedMonth)
            ->select('payroll_products.product_name', DB::raw('SUM(timecard_products.quantity) as total_units'))
            ->groupBy('payroll_products.id', 'payroll_products.product_name')
            ->get();

        // Fetch timecards and their product quantities
        $timecards = DB::table('timecards')
            ->where('employee_id', $employeeId)
            ->whereYear('work_date', $year)
            ->whereMonth('work_date', $formattedMonth)
            ->get()
            ->keyBy('work_date');

        $timecardIds = $timecards->pluck('id')->toArray();

        $productQuantities = [];
        if (!empty($timecardIds)) {
            $tpRecords = DB::table('timecard_products')
                ->whereIn('timecard_id', $timecardIds)
                ->get();

            foreach ($tpRecords as $tp) {
                $productQuantities[$tp->timecard_id][$tp->product_id] = $tp->quantity;
            }
        }

        // Calculate everything day-by-day (same logic as DetailSheetController)
        $daysWorked = 0;
        $daysLeave = 0;
        $totalProductionPay = 0;
        $totalOtAmount = 0;
        $totalDayDuty = 0;
        $totalTravelling = 0;
        $totalOther = 0;

        $daysInMonth = Carbon::createFromDate($year, $monthNumber, 1)->daysInMonth;

        for ($i = 1; $i <= $daysInMonth; $i++) {
            $currentDateStr = sprintf('%04d-%02d-%02d', $year, $monthNumber, $i);
            $date = Carbon::createFromDate($year, $monthNumber, $i);
            $dayOfWeek = $date->dayOfWeek;

            $card = $timecards->get($currentDateStr);
            $status = $card ? strtolower(trim($card->status ?? 'work')) : 'off';

            if ($card) {
                if ($status === 'leave') {
                    $daysLeave++;
                } elseif (($status === 'work' || $status === 'holiday') && $dayOfWeek !== 0) {
                    $daysWorked++;
                }
            }

            // Calculate production pay from product quantities & rates
            $dailyProdPay = 0;
            $maxQty = -1;
            $topProduct = null;

            foreach ($products as $p) {
                $qty = 0;
                if ($card && isset($productQuantities[$card->id][$p->id])) {
                    $qty = (int)$productQuantities[$card->id][$p->id];
                }
                if ($qty > 0) {
                    if ($qty > $maxQty) {
                        $maxQty = $qty;
                        $topProduct = $p;
                    }
                }
            }

            if ($card) {
                $totalQty = 0;
                foreach ($products as $p) {
                    if (isset($productQuantities[$card->id][$p->id])) {
                        $totalQty += (int)$productQuantities[$card->id][$p->id];
                    }
                }

                if ($totalQty > 0 && $topProduct !== null) {
                    if ($status === 'holiday') {
                        $dailyProdPay = $totalQty * (float)$topProduct->rate_above;
                    } else {
                        $target = ($dayOfWeek === 6) ? (int)$topProduct->target_saturday : (int)$topProduct->target_weekday;
                        $below = min($totalQty, $target);
                        $above = max(0, $totalQty - $target);
                        $dailyProdPay = ($below * (float)$topProduct->rate_below) + ($above * (float)$topProduct->rate_above);
                    }
                }
            }

            $totalProductionPay += $dailyProdPay;

            $otAmount   = $card ? (float)($card->ot_hours ?? 0) : 0;
            $dayDuty    = $card ? (float)($card->day_duty ?? 0) : 0;
            $travelling = $card ? (float)($card->travelling ?? 0) : 0;
            $other      = $card ? (float)($card->other_allowance ?? 0) : 0;

            $totalOtAmount   += $otAmount;
            $totalDayDuty    += $dayDuty;
            $totalTravelling += $travelling;
            $totalOther      += $other;
        }

        $grossPay = $totalProductionPay + $totalOtAmount + $totalDayDuty + $totalTravelling + $totalOther;

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
                'production_allowance' => $totalProductionPay,
                'overtime_allowance'   => $totalOtAmount,
                'day_duty_allowance'   => $totalDayDuty,
                'travelling_allowance' => $totalTravelling,
                'other_allowances'     => $totalOther,
                'gross_pay'            => $grossPay,
            ]
        ]);
    }
}

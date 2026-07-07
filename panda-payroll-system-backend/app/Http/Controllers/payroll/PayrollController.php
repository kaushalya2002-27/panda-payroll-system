<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\PayrollSummary;

class PayrollController extends Controller
{
    public function calculateMonthlySalary(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'year'        => 'required|integer',
            'month'       => 'required|integer',
        ]);

        $empId = $request->employee_id;
        $year  = $request->year;
        $month = $request->month;

        $monthStr = sprintf('%02d', $month);

        $timecards = DB::table('timecards')
            ->where('employee_id', $empId)
            ->whereYear('work_date', $year)
            ->whereMonth('work_date', $monthStr)
            ->get();

        $totalProductionEarnings = 0;
        $totalOtHours = 0;
        $totalDayDuty = 0;
        $totalTravelling = 0;
        $totalOtherAllowance = 0;
        $daysWorked = 0;
        $daysLeave = 0;

        foreach ($timecards as $card) {
            $status = strtolower(trim($card->status ?? 'work'));
            $dayOfWeek = (int) date('w', strtotime($card->work_date));

            $dailyProdPay = 0;

            if ($status === 'leave') {
                $daysLeave++;
                continue;
            }

            if ($status === 'work') {
                $daysWorked++;
            }

            $totalOtHours        += (float) ($card->ot_hours ?? 0);
            $totalDayDuty        += (float) ($card->day_duty ?? 0);
            $totalTravelling     += (float) ($card->travelling ?? 0);
            $totalOtherAllowance += (float) ($card->other_allowance ?? 0);

            if ($status === 'off') {
                continue;
            }
            if ($dayOfWeek === 0 && $status !== 'holiday') {
                continue;
            }

            $productRecords = DB::table('timecard_products')
                ->join('payroll_products', 'timecard_products.product_id', '=', 'payroll_products.id')
                ->where('timecard_products.timecard_id', $card->id)
                ->select(
                    'timecard_products.quantity',
                    'payroll_products.target_weekday',
                    'payroll_products.target_saturday',
                    'payroll_products.rate_above',
                    'payroll_products.rate_below'
                )
                ->get();

            $totalQty = 0;
            $maxQty = -1;
            $topProduct = null;

            foreach ($productRecords as $pr) {
                $qty = (int) $pr->quantity;
                if ($qty > 0) {
                    $totalQty += $qty;
                    if ($qty > $maxQty) {
                        $maxQty = $qty;
                        $topProduct = $pr;
                    }
                }
            }

            if ($totalQty > 0 && $topProduct !== null) {
                if ($status === 'holiday') {
                    $dailyProdPay = $totalQty * (float) $topProduct->rate_above;
                } else {
                    $target = ($dayOfWeek === 6) ? (int) $topProduct->target_saturday : (int) $topProduct->target_weekday;

                    $below = min($totalQty, $target);
                    $above = max(0, $totalQty - $target);

                    $dailyProdPay = ($below * (float) $topProduct->rate_below) + ($above * (float) $topProduct->rate_above);
                }
            }

            $totalProductionEarnings += $dailyProdPay;
        }

        $grossSalary = $totalProductionEarnings + $totalOtHours + $totalDayDuty + $totalTravelling + $totalOtherAllowance;

        PayrollSummary::updateOrCreate(
            [
                'employee_id'   => $empId,
                'payroll_year'  => $year,
                'payroll_month' => $monthStr,
            ],
            [
                'days_worked'      => $daysWorked,
                'days_leave'       => $daysLeave,
                'total_production' => $totalProductionEarnings,
                'total_ot'         => $totalOtHours,
                'total_day_duty'   => $totalDayDuty,
                'total_travelling' => $totalTravelling,
                'total_other'      => $totalOtherAllowance,
                'gross_pay'        => $grossSalary,
                'is_locked'        => false
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Summary calculated and updated successfully!'
        ], 200);
    }
}

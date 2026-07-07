<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DetailSheetController extends Controller
{
    public function getDetailSheet(Request $request)
    {
        $request->validate([
            'employee_id' => 'required',
            'year' => 'required|integer',
            'month' => 'required|integer',
        ]);

        $empId = $request->employee_id;
        $year = $request->year;
        $month = $request->month;

        $employee = DB::table('employees as e')
            ->join('departments as d', 'd.id', '=', 'e.department_id')
            ->select('e.*', 'd.name as dept_name')
            ->where('e.id', $empId)
            ->first();

        if (!$employee) {
            return response()->json(['success' => false, 'message' => 'Employee not found'], 404);
        }

        $products = DB::table('payroll_products')->where('status', 'active')->orderBy('sort_order')->get();

        $daysInMonth = Carbon::createFromDate($year, $month, 1)->daysInMonth;
        $monthStr = sprintf('%02d', $month);

        $timecards = DB::table('timecards')
            ->where('employee_id', $empId)
            ->whereYear('work_date', $year)
            ->whereMonth('work_date', $monthStr)
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

        $sheetData = [];

        // Attendance Counters
        $daysWorked = 0;
        $daysLeave = 0;

        $totalProductionPay = 0;
        $totalOtAmount = 0;
        $totalDayDuty = 0;
        $totalTravelling = 0;
        $totalOther = 0;

        for ($i = 1; $i <= $daysInMonth; $i++) {
            $currentDateStr = sprintf('%04d-%02d-%02d', $year, $month, $i);

            $date = Carbon::createFromDate($year, $month, $i);
            $dayOfWeek = $date->dayOfWeek;
            $dayName = $date->format('D');

            $card = $timecards->get($currentDateStr);
            $status = $card ? strtolower(trim($card->status ?? 'work')) : 'off';

            if ($card) {
                if ($status === 'leave') {
                    $daysLeave++;
                } elseif (($status === 'work' || $status === 'holiday') && $dayOfWeek !== 0) {

                    $daysWorked++;
                }
            }

            $quantitiesRow = [];
            $dailyProdPay = 0;
            $maxQty = -1;
            $topProduct = null;

            foreach ($products as $p) {
                $qty = 0;
                if ($card && isset($productQuantities[$card->id][$p->id])) {
                    $qty = (int)$productQuantities[$card->id][$p->id];
                }
                $quantitiesRow[$p->id] = $qty > 0 ? $qty : '-';

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

            $sheetData[] = [
                'date' => $date->format('Y-m-d'),
                'day' => $dayName,
                'status' => $card ? ucfirst($status) : 'Off',
                'quantities' => $quantitiesRow,
                'production_pay' => $dailyProdPay > 0 ? number_format($dailyProdPay, 2) : '-',
                'ot_hours' => $otAmount > 0 ? number_format($otAmount, 2) : '-',
                'day_duty' => $dayDuty > 0 ? number_format($dayDuty, 2) : '-',
                'travelling' => $travelling > 0 ? number_format($travelling, 2) : '-',
                'other' => $other > 0 ? number_format($other, 2) : '-',
            ];
        }

        $grossPay = $totalProductionPay + $totalOtAmount + $totalDayDuty + $totalTravelling + $totalOther;

        $daysOff = $daysInMonth - $daysWorked - $daysLeave;

        return response()->json([
            'success' => true,
            'employee' => [
                'code' => $employee->emp_code,
                'name' => $employee->full_name,
                'dept' => $employee->dept_name,
                'nic' => $employee->nic ?? 'N/A'
            ],
            'products' => $products,
            'sheet_data' => $sheetData,
            'summary' => [
                'days_worked' => $daysWorked,
                'days_leave' => $daysLeave,
                'days_off' => $daysOff,
                'total_production' => number_format($totalProductionPay, 2),
                'total_ot' => number_format($totalOtAmount, 2),
                'ot_earnings' => number_format($totalOtAmount, 2),
                'total_day_duty' => number_format($totalDayDuty, 2),
                'total_travelling' => number_format($totalTravelling, 2),
                'total_other' => number_format($totalOther, 2),
                'gross_pay' => number_format($grossPay, 2),
            ]
        ]);
    }
}

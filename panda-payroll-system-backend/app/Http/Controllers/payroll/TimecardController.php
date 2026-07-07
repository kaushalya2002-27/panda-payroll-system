<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Timecard;
use App\Models\PayrollProduct;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TimecardController extends Controller
{
    public function loadTimecard(Request $request)
    {
        try {
            $employeeId = $request->input('employee_id');
            $year       = (int)$request->input('year');
            $month      = (int)$request->input('month');

            if (!$employeeId) {
                return response()->json(['success' => false, 'message' => 'Employee ID is required'], 400);
            }

            $existingRecords = \Illuminate\Support\Facades\DB::table('timecards')
                ->where('employee_id', $employeeId)
                ->whereYear('work_date', $year)
                ->whereMonth('work_date', $month)
                ->get()
                ->keyBy('work_date');

            $existingQuantities = [];
            if ($existingRecords->isNotEmpty()) {
                $timecardIds = $existingRecords->pluck('id')->toArray();
                $qtys = \Illuminate\Support\Facades\DB::table('timecard_products')
                    ->whereIn('timecard_id', $timecardIds)
                    ->get();

                foreach ($qtys as $q) {
                    $existingQuantities[$q->timecard_id][$q->product_id] = (int)$q->quantity;
                }
            }

            $products = \Illuminate\Support\Facades\DB::table('payroll_products')
                ->where('status', 'Active')
                ->get();

            $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);
            $sheetData   = [];

            for ($d = 1; $d <= $daysInMonth; $d++) {
                $dateStr = sprintf('%04d-%02d-%02d', $year, $month, $d);
                $dayName = date('l', strtotime($dateStr));

                if ($existingRecords->has($dateStr)) {
                    $rec = $existingRecords->get($dateStr);
                    $totalHours = $rec->total_hours ?? '6.0';
                    $prodQtys = $existingQuantities[$rec->id] ?? [];
                } else {
                    $rec = (object)[
                        'status'          => 'work',
                        'start_time'      => '08.00',
                        'end_time'        => '14.00',
                        'ot_hours'        => '0.0',
                        'day_duty'        => '0.0',
                        'travelling'      => '0.0',
                        'other_allowance' => '0.0',
                        'gross_pay'       => '-',
                        'notes'           => ''
                    ];
                    $totalHours = '6.0';
                    $prodQtys = [];
                }

                foreach ($products as $p) {
                    if (!isset($prodQtys[$p->id])) {
                        $prodQtys[$p->id] = 0;
                    }
                }

                $sheetData[] = [
                    'date'               => $dateStr,
                    'day'                => $dayName,
                    'status'             => $rec->status,
                    'start_time'         => $rec->start_time,
                    'end_time'           => $rec->end_time,
                    'hours'              => $totalHours,
                    'ot_hours'           => $rec->ot_hours,
                    'day_duty'           => $rec->day_duty,
                    'travelling'         => $rec->travelling,
                    'other_allowance'    => $rec->other_allowance ?? $rec->other ?? '0.0',
                    'gross_pay'          => $rec->gross_pay == '-' ? '-' : number_format($rec->gross_pay, 2),
                    'notes'              => $rec->notes,
                    'product_quantities' => $prodQtys
                ];
            }

            return response()->json([
                'success'    => true,
                'sheet_data' => $sheetData
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error'   => $e->getMessage()
            ], 500);
        }
    }


    public function saveTimecard(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|integer',
            'year'        => 'required|integer',
            'month'       => 'required|integer',
            'days'        => 'required|array',
        ]);

        $empId = $request->employee_id;
        $year  = $request->year;
        $month = $request->month;
        $days  = $request->days;

        $productsMap = PayrollProduct::where('status', 'Active')->get()->keyBy('id');

        foreach ($days as $row) {
            $workDate = $row['date'];
            $status   = $row['status'];

            $dailyProductionPay = 0;
            $dayOfWeek = (int) date('w', strtotime($workDate));

            if (isset($row['product_quantities'])) {
                foreach ($row['product_quantities'] as $prodId => $qty) {
                    $qty = (int)$qty;
                    if ($qty <= 0) continue;

                    if ($dayOfWeek === 0 && $status !== 'holiday') {
                        continue;
                    }

                    if (isset($productsMap[$prodId])) {
                        $prodSettings = $productsMap[$prodId];

                        $target = ($dayOfWeek === 6)
                            ? (int)$prodSettings->target_saturday
                            : (int)$prodSettings->target_weekday;

                        if ($qty > $target) {
                            $dailyProductionPay += $qty * (float)$prodSettings->rate_above;
                        } else {
                            $dailyProductionPay += $qty * (float)$prodSettings->rate_below;
                        }
                    }
                }
            }

            $otHours        = (float)($row['ot_hours'] ?? 0);
            $dayDuty        = (float)($row['day_duty'] ?? 0);
            $travelling     = (float)($row['travelling'] ?? 0);
            $otherAllowance = (float)($row['other'] ?? 0);

            $dailyOtPay = $otHours * 150;

            $dailyGross = $dailyProductionPay + $dailyOtPay + $dayDuty + $travelling + $otherAllowance;

            $timecard = Timecard::updateOrCreate(
                [
                    'employee_id' => $empId,
                    'work_date'   => $workDate
                ],
                [
                    'status'          => $status,
                    'start_time'      => $row['start_time'] ?? '08:00',
                    'end_time'        => $row['end_time'] ?? '17:00',
                    'ot_hours'        => $otHours,
                    'day_duty'        => $dayDuty,
                    'travelling'      => $travelling,
                    'other_allowance' => $otherAllowance,
                    'gross_pay'       => $dailyGross,
                    'notes'           => $row['notes'] ?? null,
                ]
            );

            if (isset($row['product_quantities'])) {

                \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');

                foreach ($row['product_quantities'] as $prodId => $qty) {
                    $qty = (int)$qty;

                    if ($qty <= 0) {
                        \App\Models\TimecardProduct::where('timecard_id', $timecard->id)
                            ->where('product_id', $prodId)
                            ->delete();
                        continue;
                    }

                    \App\Models\TimecardProduct::updateOrCreate(
                        [
                            'timecard_id' => $timecard->id,
                            'product_id'  => $prodId
                        ],
                        [
                            'quantity'    => $qty
                        ]
                    );
                }

                \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            }
        }

        $payrollController = new \App\Http\Controllers\Payroll\PayrollController();
        $recalcRequest = new Request([
            'employee_id' => $empId,
            'year'        => (int)$year,
            'month'       => (int)$month,
        ]);
        $payrollController->calculateMonthlySalary($recalcRequest);

        return response()->json([
            'success' => true,
            'message' => 'Timecard saved and payroll updated successfully!'
        ], 200);
    }

    public function getEmployees()
    {
        try {
            $employees = \Illuminate\Support\Facades\DB::table('employees')
                ->where('is_active', 1)
                ->orderBy('emp_code', 'asc')
                ->select('id', 'emp_code', 'full_name')
                ->get();

            return response()->json([
                'success' => true,
                'employees' => $employees
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getProducts()
    {
        try {
            $products = \Illuminate\Support\Facades\DB::table('payroll_products')
                ->where('status', 'Active')
                ->orderBy('sort_order', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'products' => $products
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

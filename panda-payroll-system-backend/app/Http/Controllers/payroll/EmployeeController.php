<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    // 1. View All Employees with Filters
    public function index(Request $request)
    {
        $query = DB::table('employees as e')
                    ->join('departments as d', 'd.id', '=', 'e.department_id')
                    ->select('e.*', 'd.name as dept_name')
                    ->orderBy('e.emp_code', 'asc');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('e.full_name', 'like', "%{$search}%")
                  ->orWhere('e.emp_code', 'like', "%{$search}%")
                  ->orWhere('e.nic', 'like', "%{$search}%");
            });
        }

        if ($request->has('dept') && !empty($request->dept)) {
            $query->where('e.department_id', $request->dept);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $statusVal = ($request->status === 'active') ? 1 : 0;
            $query->where('e.is_active', $statusVal);
        }

        $employees = $query->get();
        return response()->json($employees, 200);
    }

    // 2. Generate Next Employee Code
    public function getNextCode()
    {
        $lastEmployee = DB::table('employees')->orderBy('id', 'desc')->first();

        if (!$lastEmployee) {
            $nextCode = 'EMP-0001';
        } else {
            $lastNumber = (int) str_replace('EMP-', '', $lastEmployee->emp_code);
            $nextCode = 'EMP-' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        }

        return response()->json(['next_code' => $nextCode], 200);
    }


    public function store(Request $request)
    {
        $photoName = null;
        if ($request->hasFile('photo')) {
            $image = $request->file('photo');
            $photoName = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('uploads/employees'), $photoName);
        }

        $employeeId = DB::table('employees')->insertGetId([
            'emp_code'      => $request->emp_code,
            'full_name'     => $request->full_name,
            'nic'           => $request->nic,
            'gender'        => $request->gender,
            'date_of_birth' => $request->dob ?? $request->date_of_birth,
            'join_date'     => $request->join_date,
            'department_id' => $request->department_id,
            'designation'   => $request->designation,
            'phone'         => $request->phone,
            'email'         => $request->email,
            'address'       => $request->address,
            'bank_name'     => $request->bank_name,
            'bank_branch'   => $request->bank_branch,
            'photo'         => $photoName,
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        return response()->json(['message' => 'Employee created successfully', 'id' => $employeeId], 201);
    }

    // 4. View Single Employee Profile
    public function show($id)
    {
        $employee = DB::table('employees as e')
                        ->join('departments as d', 'd.id', '=', 'e.department_id')
                        ->select('e.*', 'd.name as dept_name')
                        ->where('e.id', $id)
                        ->first();

        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        return response()->json($employee, 200);
    }

   // 5. Update Employee Details
    public function update(Request $request, $id)
    {
        $employee = Employee::find($id);
        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        $photoName = $employee->photo;

        if ($request->hasFile('photo')) {

            $request->validate([
                'photo' => 'image|max:2048'
            ]);

            if ($photoName && file_exists(public_path('uploads/employees/' . $photoName))) {
                @unlink(public_path('uploads/employees/' . $photoName));
            }

            $image = $request->file('photo');
            $photoName = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('uploads/employees'), $photoName);
        }

        $employee->update([
            'full_name'     => $request->full_name,
            'nic'           => $request->nic,
            'gender'        => $request->gender,
            'date_of_birth' => $request->date_of_birth,
            'join_date'     => $request->join_date,
            'department_id' => $request->department_id,
            'designation'   => $request->designation,
            'phone'         => $request->phone,
            'email'         => $request->email,
            'address'       => $request->address,
            'bank_name'     => $request->bank_name,
            'bank_branch'   => $request->bank_branch,
            'photo'         => $photoName,
            'is_active'     => $request->has('is_active') ? (int)$request->is_active : $employee->is_active,
        ]);

        return response()->json([
            'message' => 'Employee updated successfully',
            'photo' => $photoName
        ], 200);
    }
}

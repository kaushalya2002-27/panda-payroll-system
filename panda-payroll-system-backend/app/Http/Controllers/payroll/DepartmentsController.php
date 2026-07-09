<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DepartmentsController extends Controller
{
    /**
     * Logged in user ge userType eka anuwa ComPermission ekem permissionObject
     * eken given key eka thiyenwada kiyala check krnwa.
     * (ComPermission model ekema permissionObject eka 'array' widihta cast krla thiyena nisa
     * mehema neriely thattai type check ekk witharai danne)
     */
    private function hasPermission(string $key): bool
    {
        $user = Auth::user();

        if (!$user) {
            return false;
        }

        $comPermission = $user->comPermission;

        if (!$comPermission) {
            return false;
        }

        $permissionObject = $comPermission->permissionObject;

        if (!is_array($permissionObject)) {
            return false;
        }

        return (bool) ($permissionObject[$key] ?? false);
    }

    /**
     * Index eka PUBLIC widihta thiyenne - registration page ekem
     * department dropdown ekat login nathi userwlath data ona nisa.
     * Ee nisa methanata permission check ekk danne na.
     */
    public function index()
    {
        $departments = Department::withCount(['employees as active_employees_count' => function ($query) {
            $query->where('is_active', 1);
        }])->get();

        return response()->json($departments, 200);
    }

    public function store(Request $request)
    {
        if (!$this->hasPermission('PAYROLL_DEPARTMENTS_CREATE')) {
            return response()->json(['message' => 'You do not have permission to create departments.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $department = Department::create([
            'name' => $request->name
        ]);

        return response()->json($department, 201);
    }

    // Edit / Update
    public function update(Request $request, $id)
    {
        if (!$this->hasPermission('PAYROLL_DEPARTMENTS_EDIT')) {
            return response()->json(['message' => 'You do not have permission to update departments.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $department = Department::find($id);

        if (!$department) {
            return response()->json(['message' => 'Department not found'], 404);
        }

        $department->update([
            'name' => $request->name
        ]);

        return response()->json($department, 200);
    }

    // Delete
    public function destroy($id)
    {
        if (!$this->hasPermission('PAYROLL_DEPARTMENTS_DELETE')) {
            return response()->json(['message' => 'You do not have permission to delete departments.'], 403);
        }

        $department = Department::find($id);

        if (!$department) {
            return response()->json(['message' => 'Department not found'], 404);
        }

        $department->delete();

        return response()->json(['message' => 'Department deleted successfully'], 200);
    }
}

<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentsController extends Controller
{

    public function index()
    {
        $departments = Department::withCount(['employees as active_employees_count' => function ($query) {
        $query->where('is_active', 1);
    }])->get();

    return response()->json($departments, 200);
    }


    public function store(Request $request)
    {
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
        $department = Department::find($id);

        if (!$department) {
            return response()->json(['message' => 'Department not found'], 404);
        }

        $department->delete();

        return response()->json(['message' => 'Department deleted successfully'], 200);
    }
}

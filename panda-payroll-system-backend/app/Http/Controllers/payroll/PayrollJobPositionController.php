<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\PayrollJobPosition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PayrollJobPositionController extends Controller
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
     * job position dropdown ekat login nathi userwlath data ona nisa.
     * Ee nisa methanata permission check ekk danne na.
     */
    public function index()
    {
        $positions = PayrollJobPosition::all();
        return response()->json($positions, 200);
    }

    public function store(Request $request)
    {
        if (!$this->hasPermission('PAYROLL_JOB_POSITIONS_CREATE')) {
            return response()->json(['message' => 'You do not have permission to create job positions.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $position = PayrollJobPosition::create([
            'name' => $request->name
        ]);

        return response()->json($position, 201);
    }

    public function update(Request $request, $id)
    {
        if (!$this->hasPermission('PAYROLL_JOB_POSITIONS_EDIT')) {
            return response()->json(['message' => 'You do not have permission to update job positions.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $position = PayrollJobPosition::find($id);

        if (!$position) {
            return response()->json(['message' => 'Job Position not found'], 404);
        }

        $position->update([
            'name' => $request->name
        ]);

        return response()->json($position, 200);
    }

    public function destroy($id)
    {
        if (!$this->hasPermission('PAYROLL_JOB_POSITIONS_DELETE')) {
            return response()->json(['message' => 'You do not have permission to delete job positions.'], 403);
        }

        $position = PayrollJobPosition::find($id);

        if (!$position) {
            return response()->json(['message' => 'Job Position not found'], 404);
        }

        $position->delete();

        return response()->json(['message' => 'Job Position deleted successfully'], 200);
    }
}

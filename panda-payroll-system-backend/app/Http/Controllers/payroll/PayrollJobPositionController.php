<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\PayrollJobPosition;
use Illuminate\Http\Request;

class PayrollJobPositionController extends Controller
{
    public function index()
    {
        $positions = PayrollJobPosition::all();
        return response()->json($positions, 200);
    }

    public function store(Request $request)
    {
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
        $position = PayrollJobPosition::find($id);

        if (!$position) {
            return response()->json(['message' => 'Job Position not found'], 404);
        }

        $position->delete();

        return response()->json(['message' => 'Job Position deleted successfully'], 200);
    }
}

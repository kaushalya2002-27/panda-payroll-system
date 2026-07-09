<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PayrollProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $products = DB::table('payroll_products')
                ->orderBy('sort_order', 'asc')
                ->get()
                ->map(function($product) {
                    return [
                        'id'              => $product->id,
                        'product_name'    => $product->product_name,
                        'target_weekday'  => $product->target_weekday,
                        'target_saturday' => $product->target_saturday,
                        'rate_above'      => $product->rate_above,
                        'rate_below'      => $product->rate_below,
                        'sort_order'      => $product->sort_order,
                        'status'          => $product->status,
                    ];
                })->toArray();

            return response()->json($products, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'product_name'    => 'required|string|max:150',
                'target_weekday'  => 'required|integer',
                'target_saturday' => 'required|integer',
                'rate_above'      => 'required|numeric',
                'rate_below'      => 'required|numeric',
                'sort_order'      => 'nullable|integer',
                'status'          => 'required|string'
            ]);

            $productId = DB::table('payroll_products')->insertGetId([
                'product_name'    => $validatedData['product_name'],
                'target_weekday'  => $validatedData['target_weekday'],
                'target_saturday' => $validatedData['target_saturday'],
                'rate_above'      => $validatedData['rate_above'],
                'rate_below'      => $validatedData['rate_below'],
                'sort_order'      => $validatedData['sort_order'] ?? 0,
                'status'          => $validatedData['status'],
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Product saved successfully!',
                'id' => $productId
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'error' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $validatedData = $request->validate([
                'product_name'    => 'required|string|max:150',
                'target_weekday'  => 'required|integer',
                'target_saturday' => 'required|integer',
                'rate_above'      => 'required|numeric',
                'rate_below'      => 'required|numeric',
                'sort_order'      => 'nullable|integer',
                'status'          => 'required|string'
            ]);

            DB::table('payroll_products')->where('id', $id)->update([
                'product_name'    => $validatedData['product_name'],
                'target_weekday'  => $validatedData['target_weekday'],
                'target_saturday' => $validatedData['target_saturday'],
                'rate_above'      => $validatedData['rate_above'],
                'rate_below'      => $validatedData['rate_below'],
                'sort_order'      => $validatedData['sort_order'] ?? 0,
                'status'          => $validatedData['status'],
                'updated_at'      => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully!'
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'error' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $deleted = DB::table('payroll_products')->where('id', $id)->delete();

            if (! $deleted) {
                return response()->json(['success' => false, 'message' => 'Product not found.'], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully!'
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}

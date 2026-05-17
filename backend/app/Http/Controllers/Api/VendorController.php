<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Http\Requests\StoreVendorRequest;
use App\Http\Requests\UpdateVendorRequest;
use App\Http\Resources\VendorResource;

class VendorController extends Controller
{
    public function index()
    {
        $vendors = Vendor::all();
        return response()->json([
            'success' => true,
            'message' => 'Vendors retrieved successfully',
            'data' => VendorResource::collection($vendors)
        ]);
    }

    public function store(StoreVendorRequest $request)
    {
        $vendor = Vendor::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Vendor created successfully',
            'data' => new VendorResource($vendor)
        ], 201);
    }

    public function show(Vendor $vendor)
    {
        return response()->json([
            'success' => true,
            'message' => 'Vendor retrieved successfully',
            'data' => new VendorResource($vendor)
        ]);
    }

    public function update(UpdateVendorRequest $request, Vendor $vendor)
    {
        $vendor->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Vendor updated successfully',
            'data' => new VendorResource($vendor)
        ]);
    }

    public function destroy(Vendor $vendor)
    {
        $vendor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Vendor deleted successfully',
            'data' => null
        ]);
    }
}

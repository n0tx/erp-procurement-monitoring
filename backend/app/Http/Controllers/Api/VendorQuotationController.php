<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VendorQuotation;
use App\Services\VendorQuotationService;
use App\Http\Requests\StoreVendorQuotationRequest;
use App\Http\Resources\VendorQuotationResource;
use Illuminate\Http\Request;
use Exception;

class VendorQuotationController extends Controller
{
    protected VendorQuotationService $quotationService;

    public function __construct(VendorQuotationService $quotationService)
    {
        $this->quotationService = $quotationService;
    }

    public function index(Request $request)
    {
        $query = VendorQuotation::with(['purchaseRequest', 'vendor']);

        if ($request->has('purchase_request_id')) {
            $query->where('purchase_request_id', $request->purchase_request_id);
        }
        
        $quotations = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Vendor quotations retrieved successfully',
            'data' => VendorQuotationResource::collection($quotations)
        ]);
    }

    public function store(StoreVendorQuotationRequest $request)
    {
        try {
            $quotation = $this->quotationService->create($request->validated());
            return response()->json([
                'success' => true,
                'message' => 'Vendor Quotation created successfully',
                'data' => new VendorQuotationResource($quotation->load('details'))
            ], 201);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function show(VendorQuotation $vendorQuotation)
    {
        return response()->json([
            'success' => true,
            'message' => 'Vendor Quotation retrieved successfully',
            'data' => new VendorQuotationResource($vendorQuotation->load(['purchaseRequest', 'vendor', 'details.item']))
        ]);
    }

    public function select(VendorQuotation $vendorQuotation)
    {
        try {
            $quotation = $this->quotationService->select($vendorQuotation);
            return response()->json([
                'success' => true,
                'message' => 'Vendor Quotation selected successfully',
                'data' => new VendorQuotationResource($quotation)
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function reject(VendorQuotation $vendorQuotation)
    {
        try {
            $quotation = $this->quotationService->reject($vendorQuotation);
            return response()->json([
                'success' => true,
                'message' => 'Vendor Quotation rejected successfully',
                'data' => new VendorQuotationResource($quotation)
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}

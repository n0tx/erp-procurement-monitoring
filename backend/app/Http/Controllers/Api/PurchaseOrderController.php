<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Services\PurchaseOrderService;
use App\Http\Requests\StorePurchaseOrderRequest;
use App\Http\Resources\PurchaseOrderResource;
use Illuminate\Http\Request;
use Exception;

class PurchaseOrderController extends Controller
{
    protected PurchaseOrderService $poService;

    public function __construct(PurchaseOrderService $poService)
    {
        $this->poService = $poService;
    }

    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['purchaseRequest', 'vendor', 'creator']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        $pos = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Purchase Orders retrieved successfully',
            'data' => PurchaseOrderResource::collection($pos)
        ]);
    }

    public function store(StorePurchaseOrderRequest $request)
    {
        try {
            $po = $this->poService->create($request->validated());
            return response()->json([
                'success' => true,
                'message' => 'Purchase Order created successfully',
                'data' => new PurchaseOrderResource($po->load('details'))
            ], 201);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        return response()->json([
            'success' => true,
            'message' => 'Purchase Order retrieved successfully',
            'data' => new PurchaseOrderResource($purchaseOrder->load(['purchaseRequest', 'vendor', 'creator', 'details.item']))
        ]);
    }

    public function issue(PurchaseOrder $purchaseOrder)
    {
        try {
            $po = $this->poService->issue($purchaseOrder);
            return response()->json([
                'success' => true,
                'message' => 'Purchase Order issued successfully',
                'data' => new PurchaseOrderResource($po)
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function deliver(PurchaseOrder $purchaseOrder)
    {
        try {
            $po = $this->poService->deliver($purchaseOrder);
            return response()->json([
                'success' => true,
                'message' => 'Purchase Order marked as delivered successfully',
                'data' => new PurchaseOrderResource($po)
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function close(PurchaseOrder $purchaseOrder)
    {
        try {
            $po = $this->poService->close($purchaseOrder);
            return response()->json([
                'success' => true,
                'message' => 'Purchase Order closed successfully',
                'data' => new PurchaseOrderResource($po)
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}

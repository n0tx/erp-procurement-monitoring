<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseRequest;
use App\Services\PurchaseRequestService;
use App\Http\Requests\StorePurchaseRequestRequest;
use App\Http\Requests\UpdatePurchaseRequestRequest;
use App\Http\Resources\PurchaseRequestResource;
use Illuminate\Http\Request;
use Exception;

class PurchaseRequestController extends Controller
{
    protected PurchaseRequestService $prService;

    public function __construct(PurchaseRequestService $prService)
    {
        $this->prService = $prService;
    }

    public function index(Request $request)
    {
        $query = PurchaseRequest::with(['project', 'department', 'requester', 'approver']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $prs = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Purchase Requests retrieved successfully',
            'data' => PurchaseRequestResource::collection($prs)
        ]);
    }

    public function store(StorePurchaseRequestRequest $request)
    {
        try {
            $pr = $this->prService->create($request->validated());
            return response()->json([
                'success' => true,
                'message' => 'Purchase Request created successfully',
                'data' => new PurchaseRequestResource($pr->load('details'))
            ], 201);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function show(PurchaseRequest $purchaseRequest)
    {
        $purchaseRequest->load(['project', 'department', 'requester', 'approver', 'details.item']);
        return response()->json([
            'success' => true,
            'message' => 'Purchase Request retrieved successfully',
            'data' => new PurchaseRequestResource($purchaseRequest)
        ]);
    }

    public function update(UpdatePurchaseRequestRequest $request, PurchaseRequest $purchaseRequest)
    {
        try {
            $pr = $this->prService->update($purchaseRequest, $request->validated());
            return response()->json([
                'success' => true,
                'message' => 'Purchase Request updated successfully',
                'data' => new PurchaseRequestResource($pr->load('details'))
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function destroy(PurchaseRequest $purchaseRequest)
    {
        if ($purchaseRequest->status !== 'draft') {
            return response()->json(['success' => false, 'message' => 'Only draft requests can be deleted.'], 400);
        }

        $purchaseRequest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Purchase Request deleted successfully',
            'data' => null
        ]);
    }

    public function submit(PurchaseRequest $purchaseRequest)
    {
        try {
            $pr = $this->prService->submit($purchaseRequest);
            return response()->json([
                'success' => true,
                'message' => 'Purchase Request submitted successfully',
                'data' => new PurchaseRequestResource($pr)
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function approve(Request $request, PurchaseRequest $purchaseRequest)
    {
        try {
            $pr = $this->prService->approve($purchaseRequest, $request->notes);
            return response()->json([
                'success' => true,
                'message' => 'Purchase Request approved successfully',
                'data' => new PurchaseRequestResource($pr)
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function reject(Request $request, PurchaseRequest $purchaseRequest)
    {
        try {
            $pr = $this->prService->reject($purchaseRequest, $request->notes);
            return response()->json([
                'success' => true,
                'message' => 'Purchase Request rejected successfully',
                'data' => new PurchaseRequestResource($pr)
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}

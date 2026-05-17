<?php

namespace App\Services;

use App\Models\PurchaseOrder;
use App\Models\PurchaseRequest;
use App\Models\VendorQuotation;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;

class PurchaseOrderService
{
    protected ApprovalService $approvalService;

    public function __construct(ApprovalService $approvalService)
    {
        $this->approvalService = $approvalService;
    }

    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {
            $pr = PurchaseRequest::findOrFail($data['purchase_request_id']);
            
            // Check if PR already has a PO
            if ($pr->purchaseOrder) {
                throw new Exception("Purchase Request already has a Purchase Order.");
            }

            // Find selected quotation
            $quotation = VendorQuotation::where('purchase_request_id', $data['purchase_request_id'])
                ->where('vendor_id', $data['vendor_id'])
                ->where('status', 'selected')
                ->first();

            if (!$quotation) {
                throw new Exception("No selected quotation found for this Vendor and Purchase Request.");
            }

            // Generate PO Number
            $count = PurchaseOrder::count() + 1;
            $poNumber = 'PO-' . date('Ym') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

            $po = PurchaseOrder::create([
                'po_number' => $poNumber,
                'purchase_request_id' => $data['purchase_request_id'],
                'vendor_id' => $data['vendor_id'],
                'po_date' => $data['po_date'],
                'total_amount' => $quotation->total_amount,
                'status' => 'draft',
                'created_by' => Auth::id() ?? 1,
            ]);

            // Copy items from selected quotation
            foreach ($quotation->details as $detail) {
                $po->details()->create([
                    'item_id' => $detail->item_id,
                    'qty' => $detail->qty,
                    'price' => $detail->price,
                    'subtotal' => $detail->subtotal,
                ]);
            }

            return $po;
        });
    }

    public function issue(PurchaseOrder $po)
    {
        if ($po->status !== 'draft') {
            throw new Exception("Only draft purchase orders can be issued.");
        }

        $po->update(['status' => 'issued']);
        $this->approvalService->log('purchase_order', $po->id, 'issued_po', 'PO issued to vendor.');

        return $po;
    }

    public function deliver(PurchaseOrder $po)
    {
        if ($po->status !== 'issued') {
            throw new Exception("Only issued purchase orders can be marked as delivered.");
        }

        $po->update(['status' => 'delivered']);
        
        // Also update project status slightly if it's the first delivery, but for MVP keep it simple
        $po->purchaseRequest->project()->update(['status' => 'running']);

        return $po;
    }

    public function close(PurchaseOrder $po)
    {
        if ($po->status === 'closed') {
            throw new Exception("Purchase Order is already closed.");
        }

        $po->update(['status' => 'closed']);
        
        // Mark PR as completed
        $po->purchaseRequest()->update(['status' => 'completed']);
        
        $this->approvalService->log('purchase_order', $po->id, 'closed_po', 'PO closed.');

        return $po;
    }
}

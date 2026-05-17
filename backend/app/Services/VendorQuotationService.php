<?php

namespace App\Services;

use App\Models\VendorQuotation;
use App\Models\PurchaseRequest;
use Illuminate\Support\Facades\DB;
use Exception;

class VendorQuotationService
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
            
            if ($pr->status !== 'approved') {
                throw new Exception("Quotation can only be created for approved Purchase Requests.");
            }

            // Generate Quotation Number
            $count = VendorQuotation::count() + 1;
            $quotationNumber = 'VQ-' . date('Ym') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

            $quotation = VendorQuotation::create([
                'purchase_request_id' => $data['purchase_request_id'],
                'vendor_id' => $data['vendor_id'],
                'quotation_number' => $quotationNumber,
                'quotation_date' => $data['quotation_date'],
                'status' => 'pending',
                'total_amount' => 0, // will be calculated below
            ]);

            $totalAmount = 0;

            foreach ($data['details'] as $detail) {
                $subtotal = $detail['qty'] * $detail['price'];
                $totalAmount += $subtotal;

                $quotation->details()->create([
                    'item_id' => $detail['item_id'],
                    'qty' => $detail['qty'],
                    'price' => $detail['price'],
                    'subtotal' => $subtotal,
                ]);
            }

            $quotation->update(['total_amount' => $totalAmount]);

            return $quotation;
        });
    }

    public function select(VendorQuotation $quotation)
    {
        if ($quotation->status !== 'pending') {
            throw new Exception("Only pending quotations can be selected.");
        }

        return DB::transaction(function () use ($quotation) {
            // Reject other pending quotations for this PR
            VendorQuotation::where('purchase_request_id', $quotation->purchase_request_id)
                ->where('id', '!=', $quotation->id)
                ->where('status', 'pending')
                ->update(['status' => 'rejected']);

            $quotation->update([
                'status' => 'selected',
                'selected_at' => now(),
            ]);

            // Update PR status
            $quotation->purchaseRequest()->update(['status' => 'processed']);

            $this->approvalService->log('vendor_quotation', $quotation->id, 'selected_vendor', 'Vendor selected for PR.');

            return $quotation;
        });
    }

    public function reject(VendorQuotation $quotation)
    {
        if ($quotation->status !== 'pending') {
            throw new Exception("Only pending quotations can be rejected.");
        }

        $quotation->update(['status' => 'rejected']);
        $this->approvalService->log('vendor_quotation', $quotation->id, 'rejected', 'Quotation rejected.');

        return $quotation;
    }
}

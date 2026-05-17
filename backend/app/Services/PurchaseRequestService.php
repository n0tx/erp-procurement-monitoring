<?php

namespace App\Services;

use App\Models\PurchaseRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;

class PurchaseRequestService
{
    protected ApprovalService $approvalService;

    public function __construct(ApprovalService $approvalService)
    {
        $this->approvalService = $approvalService;
    }

    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {
            // Generate PR Number
            $count = PurchaseRequest::count() + 1;
            $prNumber = 'PR-EPC-' . date('Ym') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

            $pr = PurchaseRequest::create([
                'pr_number' => $prNumber,
                'project_id' => $data['project_id'],
                'department_id' => $data['department_id'],
                'requested_by' => Auth::id() ?? 1,
                'request_date' => $data['request_date'],
                'notes' => $data['notes'] ?? null,
                'status' => 'draft',
            ]);

            foreach ($data['details'] as $detail) {
                $pr->details()->create([
                    'item_id' => $detail['item_id'],
                    'qty' => $detail['qty'],
                    'estimated_price' => $detail['estimated_price'],
                    'remarks' => $detail['remarks'] ?? null,
                ]);
            }

            return $pr;
        });
    }

    public function update(PurchaseRequest $pr, array $data)
    {
        if ($pr->status !== 'draft') {
            throw new Exception("Only draft purchase requests can be updated.");
        }

        return DB::transaction(function () use ($pr, $data) {
            $pr->update([
                'project_id' => $data['project_id'],
                'department_id' => $data['department_id'],
                'request_date' => $data['request_date'],
                'notes' => $data['notes'] ?? null,
            ]);

            // Recreate details for simplicity
            $pr->details()->delete();

            foreach ($data['details'] as $detail) {
                $pr->details()->create([
                    'item_id' => $detail['item_id'],
                    'qty' => $detail['qty'],
                    'estimated_price' => $detail['estimated_price'],
                    'remarks' => $detail['remarks'] ?? null,
                ]);
            }

            return $pr->fresh('details');
        });
    }

    public function submit(PurchaseRequest $pr)
    {
        if ($pr->status !== 'draft') {
            throw new Exception("Only draft purchase requests can be submitted.");
        }

        $pr->update(['status' => 'submitted']);
        
        $this->approvalService->log('purchase_request', $pr->id, 'submitted', 'Purchase Request submitted for approval.');

        return $pr;
    }

    public function approve(PurchaseRequest $pr, string $notes = null)
    {
        if ($pr->status !== 'submitted') {
            throw new Exception("Only submitted purchase requests can be approved.");
        }

        $pr->update([
            'status' => 'approved',
            'approved_by' => Auth::id() ?? 1,
            'approved_at' => now(),
        ]);
        
        $this->approvalService->log('purchase_request', $pr->id, 'approved', $notes);

        return $pr;
    }

    public function reject(PurchaseRequest $pr, string $notes = null)
    {
        if ($pr->status !== 'submitted') {
            throw new Exception("Only submitted purchase requests can be rejected.");
        }

        $pr->update([
            'status' => 'rejected',
            'rejected_by' => Auth::id() ?? 1,
            'rejected_at' => now(),
        ]);
        
        $this->approvalService->log('purchase_request', $pr->id, 'rejected', $notes);

        return $pr;
    }
}

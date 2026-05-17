<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'po_number' => $this->po_number,
            'purchase_request_id' => $this->purchase_request_id,
            'pr_number' => $this->purchaseRequest->pr_number ?? null,
            'vendor_id' => $this->vendor_id,
            'vendor_name' => $this->vendor->vendor_name ?? null,
            'po_date' => $this->po_date,
            'total_amount' => $this->total_amount,
            'status' => $this->status,
            'created_by' => $this->created_by,
            'creator_name' => $this->creator->name ?? null,
            'details' => $this->whenLoaded('details'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

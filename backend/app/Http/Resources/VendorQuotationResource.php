<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VendorQuotationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'purchase_request_id' => $this->purchase_request_id,
            'pr_number' => $this->purchaseRequest->pr_number ?? null,
            'vendor_id' => $this->vendor_id,
            'vendor_name' => $this->vendor->vendor_name ?? null,
            'quotation_number' => $this->quotation_number,
            'quotation_date' => $this->quotation_date,
            'total_amount' => $this->total_amount,
            'status' => $this->status,
            'selected_at' => $this->selected_at,
            'details' => $this->whenLoaded('details'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

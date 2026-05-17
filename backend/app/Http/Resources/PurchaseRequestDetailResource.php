<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseRequestDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'purchase_request_id' => $this->purchase_request_id,
            'item_id' => $this->item_id,
            'item_code' => $this->item->item_code ?? null,
            'item_name' => $this->item->item_name ?? null,
            'qty' => $this->qty,
            'estimated_price' => $this->estimated_price,
            'remarks' => $this->remarks,
        ];
    }
}

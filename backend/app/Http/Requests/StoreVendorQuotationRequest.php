<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVendorQuotationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'purchase_request_id' => 'required|exists:purchase_requests,id',
            'vendor_id' => 'required|exists:vendors,id',
            'quotation_date' => 'required|date',
            'details' => 'required|array|min:1',
            'details.*.item_id' => 'required|exists:items,id',
            'details.*.qty' => 'required|numeric|min:0.01',
            'details.*.price' => 'required|numeric|min:0',
        ];
    }
}

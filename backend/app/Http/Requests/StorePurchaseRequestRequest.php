<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id' => 'required|exists:projects,id',
            'department_id' => 'required|exists:departments,id',
            'request_date' => 'required|date',
            'notes' => 'nullable|string',
            'details' => 'required|array|min:1',
            'details.*.item_id' => 'required|exists:items,id',
            'details.*.qty' => 'required|numeric|min:0.01',
            'details.*.estimated_price' => 'required|numeric|min:0',
            'details.*.remarks' => 'nullable|string',
        ];
    }
}

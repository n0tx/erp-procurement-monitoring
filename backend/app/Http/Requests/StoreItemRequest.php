<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'item_code' => 'required|string|unique:items,item_code|max:50',
            'item_name' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
            'category' => 'nullable|string|max:100',
            'estimated_price' => 'nullable|numeric|min:0',
        ];
    }
}

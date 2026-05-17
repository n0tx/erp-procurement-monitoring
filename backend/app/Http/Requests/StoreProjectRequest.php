<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_code' => 'required|string|unique:projects,project_code|max:50',
            'project_name' => 'required|string|max:255',
            'client_name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|string|in:planning,running,completed',
            'progress_percentage' => 'nullable|integer|min:0|max:100',
        ];
    }
}

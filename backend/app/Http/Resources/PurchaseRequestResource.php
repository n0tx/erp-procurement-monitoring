<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'pr_number' => $this->pr_number,
            'project_id' => $this->project_id,
            'project_name' => $this->project->project_name ?? null,
            'department_id' => $this->department_id,
            'department_name' => $this->department->name ?? null,
            'requested_by' => $this->requested_by,
            'requester_name' => $this->requester->name ?? null,
            'request_date' => $this->request_date,
            'status' => $this->status,
            'notes' => $this->notes,
            'approved_by' => $this->approved_by,
            'approver_name' => $this->approver->name ?? null,
            'approved_at' => $this->approved_at,
            'rejected_by' => $this->rejected_by,
            'rejected_at' => $this->rejected_at,
            'details' => PurchaseRequestDetailResource::collection($this->whenLoaded('details')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

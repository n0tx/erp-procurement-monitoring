<?php

namespace App\Services;

use App\Models\ApprovalLog;
use Illuminate\Support\Facades\Auth;

class ApprovalService
{
    /**
     * Log an approval action
     */
    public function log(string $referenceType, int $referenceId, string $action, ?string $notes = null): ApprovalLog
    {
        return ApprovalLog::create([
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'action' => $action,
            'notes' => $notes,
            'acted_by' => Auth::id() ?? 1, // fallback for demo
            'acted_at' => now(),
        ]);
    }
}

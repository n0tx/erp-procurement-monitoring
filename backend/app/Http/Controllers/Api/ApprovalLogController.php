<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApprovalLog;
use App\Http\Resources\ApprovalLogResource;
use Illuminate\Http\Request;

class ApprovalLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ApprovalLog::with('actor');

        if ($request->has('reference_type')) {
            $query->where('reference_type', $request->reference_type);
        }

        if ($request->has('reference_id')) {
            $query->where('reference_id', $request->reference_id);
        }

        $logs = $query->orderBy('acted_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Approval Logs retrieved successfully',
            'data' => ApprovalLogResource::collection($logs)
        ]);
    }
}

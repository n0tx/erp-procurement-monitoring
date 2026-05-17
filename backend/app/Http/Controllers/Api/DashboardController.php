<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseRequest;
use App\Models\PurchaseOrder;
use App\Models\Project;
use App\Models\VendorQuotation;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function procurement()
    {
        return response()->json([
            'success' => true,
            'message' => 'Procurement dashboard data retrieved successfully',
            'data' => [
                'total_pr' => PurchaseRequest::count(),
                'pending_approval' => PurchaseRequest::where('status', 'submitted')->count(),
                'approved_pr' => PurchaseRequest::where('status', 'approved')->count(),
                'issued_po' => PurchaseOrder::where('status', 'issued')->count(),
                'active_projects' => Project::whereIn('status', ['planning', 'running'])->count(),
                'pending_quotations' => VendorQuotation::where('status', 'pending')->count(),
            ]
        ]);
    }

    public function projects()
    {
        return response()->json([
            'success' => true,
            'message' => 'Project dashboard data retrieved successfully',
            'data' => [
                'total_projects' => Project::count(),
                'running_projects' => Project::where('status', 'running')->count(),
                'completed_projects' => Project::where('status', 'completed')->count(),
                'total_pr' => PurchaseRequest::count(),
                'total_po' => PurchaseOrder::count(),
            ]
        ]);
    }
}

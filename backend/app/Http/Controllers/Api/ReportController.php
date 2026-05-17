<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseRequest;
use App\Models\PurchaseOrder;
use App\Models\Vendor;
use App\Models\Project;
use Illuminate\Http\Request;
use App\Http\Resources\PurchaseRequestResource;
use App\Http\Resources\PurchaseOrderResource;
use App\Http\Resources\VendorResource;
use App\Http\Resources\ProjectResource;

class ReportController extends Controller
{
    public function purchaseRequests(Request $request)
    {
        $query = PurchaseRequest::with(['project', 'department', 'requester', 'approver']);

        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('date_from')) {
            $query->whereDate('request_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('request_date', '<=', $request->date_to);
        }

        $prs = $query->orderBy('request_date', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Purchase Request Report generated',
            'data' => PurchaseRequestResource::collection($prs)
        ]);
    }

    public function purchaseOrders(Request $request)
    {
        $query = PurchaseOrder::with(['purchaseRequest', 'vendor', 'creator']);

        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('date_from')) {
            $query->whereDate('po_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('po_date', '<=', $request->date_to);
        }

        $pos = $query->orderBy('po_date', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Purchase Order Report generated',
            'data' => PurchaseOrderResource::collection($pos)
        ]);
    }

    public function vendors(Request $request)
    {
        $query = Vendor::query();
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $vendors = $query->orderBy('vendor_name', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Vendor Report generated',
            'data' => VendorResource::collection($vendors)
        ]);
    }

    public function projects(Request $request)
    {
        $query = Project::query();
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $projects = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Project Report generated',
            'data' => ProjectResource::collection($projects)
        ]);
    }
}

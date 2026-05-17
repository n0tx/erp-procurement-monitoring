<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\VendorController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\PurchaseRequestController;
use App\Http\Controllers\Api\VendorQuotationController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ApprovalLogController;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Master Data
    Route::apiResource('roles', RoleController::class)->only(['index']);
    Route::apiResource('departments', DepartmentController::class);
    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('vendors', VendorController::class);
    Route::apiResource('items', ItemController::class);

    // Purchase Requests
    Route::apiResource('purchase-requests', PurchaseRequestController::class);
    Route::post('purchase-requests/{purchase_request}/submit', [PurchaseRequestController::class, 'submit']);
    Route::post('purchase-requests/{purchase_request}/approve', [PurchaseRequestController::class, 'approve']);
    Route::post('purchase-requests/{purchase_request}/reject', [PurchaseRequestController::class, 'reject']);

    // Vendor Quotations
    Route::apiResource('vendor-quotations', VendorQuotationController::class);
    Route::post('vendor-quotations/{vendor_quotation}/select', [VendorQuotationController::class, 'select']);
    Route::post('vendor-quotations/{vendor_quotation}/reject', [VendorQuotationController::class, 'reject']);

    // Purchase Orders
    Route::apiResource('purchase-orders', PurchaseOrderController::class);
    Route::post('purchase-orders/{purchase_order}/issue', [PurchaseOrderController::class, 'issue']);
    Route::post('purchase-orders/{purchase_order}/deliver', [PurchaseOrderController::class, 'deliver']);
    Route::post('purchase-orders/{purchase_order}/close', [PurchaseOrderController::class, 'close']);

    // Dashboard
    Route::get('dashboard/procurement', [DashboardController::class, 'procurement']);
    Route::get('dashboard/projects', [DashboardController::class, 'projects']);

    // Reports
    Route::get('reports/purchase-requests', [ReportController::class, 'purchaseRequests']);
    Route::get('reports/purchase-orders', [ReportController::class, 'purchaseOrders']);
    Route::get('reports/vendors', [ReportController::class, 'vendors']);
    Route::get('reports/projects', [ReportController::class, 'projects']);

    // Approval Logs
    Route::get('approval-logs', [ApprovalLogController::class, 'index']);
});

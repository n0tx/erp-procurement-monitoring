<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Item;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderDetail;
use App\Models\PurchaseRequest;
use App\Models\PurchaseRequestDetail;
use Spatie\Permission\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorQuotation;
use App\Models\VendorQuotationDetail;
use App\Models\ApprovalLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | ROLES
        |--------------------------------------------------------------------------
        */

        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $projectUserRole = Role::firstOrCreate(['name' => 'project_user']);
        $approverRole = Role::firstOrCreate(['name' => 'approver']);
        $procurementRole = Role::firstOrCreate(['name' => 'procurement']);

        /*
        |--------------------------------------------------------------------------
        | DEPARTMENTS
        |--------------------------------------------------------------------------
        */

        $engineeringDept = Department::firstOrCreate(['code' => 'ENG'], ['name' => 'Engineering']);
        $procurementDept = Department::firstOrCreate(['code' => 'PROC'], ['name' => 'Procurement']);
        $projectDept = Department::firstOrCreate(['code' => 'PROJ'], ['name' => 'Project Management']);
        $manufacturingDept = Department::firstOrCreate(['code' => 'MFG'], ['name' => 'Manufacturing / Fabrication']);
        $qaDept = Department::firstOrCreate(['code' => 'QA'], ['name' => 'Quality Assurance (QA/QC)']);

        /*
        |--------------------------------------------------------------------------
        | USERS (GENERIC EPC DEMO)
        |--------------------------------------------------------------------------
        */

        $admin = User::firstOrCreate(['email' => 'admin@demo-epc.com'], [
            'name' => 'System Admin',
            'password' => Hash::make('password'),
            'department_id' => $procurementDept->id,
        ]);
        $admin->assignRole($adminRole);

        $projectUser = User::firstOrCreate(['email' => 'project@demo-epc.com'], [
            'name' => 'Site Engineer',
            'password' => Hash::make('password'),
            'department_id' => $projectDept->id,
        ]);
        $projectUser->assignRole($projectUserRole);

        $approver = User::firstOrCreate(['email' => 'manager@demo-epc.com'], [
            'name' => 'Project Manager',
            'password' => Hash::make('password'),
            'department_id' => $projectDept->id,
        ]);
        $approver->assignRole($approverRole);

        $procurement = User::firstOrCreate(['email' => 'procurement@demo-epc.com'], [
            'name' => 'Procurement Specialist',
            'password' => Hash::make('password'),
            'department_id' => $procurementDept->id,
        ]);
        $procurement->assignRole($procurementRole);

        /*
        |--------------------------------------------------------------------------
        | PROJECTS (EPC / FABRICATION FOCUS)
        |--------------------------------------------------------------------------
        */

        $project1 = Project::firstOrCreate(['project_code' => 'EPC-001'], [
            'project_name' => 'EPC PLTU Lontar Extension',
            'client_name' => 'PT PLN (Persero)',
            'start_date' => now()->subMonths(6),
            'end_date' => now()->addMonths(12),
            'status' => 'running',
            'progress_percentage' => 45,
            'created_by' => $admin->id,
        ]);

        $project2 = Project::firstOrCreate(['project_code' => 'FAB-002'], [
            'project_name' => 'Fabrikasi Pressure Vessel & Heat Exchanger',
            'client_name' => 'PT Pertamina Hulu Energi',
            'start_date' => now()->subMonths(2),
            'end_date' => now()->addMonths(6),
            'status' => 'running',
            'progress_percentage' => 30,
            'created_by' => $admin->id,
        ]);

        /*
        |--------------------------------------------------------------------------
        | VENDORS (STEEL, PIPE, & EQUIPMENT SUPPLIERS)
        |--------------------------------------------------------------------------
        */

        $vendor1 = Vendor::firstOrCreate(['vendor_name' => 'PT Krakatau Steel (Persero) Tbk'], [
            'email' => 'sales@krakatausteel.com',
            'phone' => '0254-392159',
            'address' => 'Cilegon, Banten',
            'npwp' => '01.000.000.0-000.000',
            'status' => 'active',
        ]);

        $vendor2 = Vendor::firstOrCreate(['vendor_name' => 'PT Seamless Pipe Indonesia Jaya'], [
            'email' => 'sales@spij.co.id',
            'phone' => '0254-386222',
            'address' => 'Cilegon, Banten',
            'npwp' => '01.234.567.8-417.000',
            'status' => 'active',
        ]);

        /*
        |--------------------------------------------------------------------------
        | ITEMS (FABRICATION MATERIALS)
        |--------------------------------------------------------------------------
        */

        $item1 = Item::firstOrCreate(['item_code' => 'MAT-CS-001'], [
            'item_name' => 'Carbon Steel Plate A36 - 12mm x 4ft x 8ft',
            'unit' => 'Lembar',
            'category' => 'Raw Material - Steel',
            'estimated_price' => 3500000,
        ]);

        $item2 = Item::firstOrCreate(['item_code' => 'MAT-SP-002'], [
            'item_name' => 'Seamless Pipe API 5L Grade B 10" SCH 40',
            'unit' => 'Batang',
            'category' => 'Piping',
            'estimated_price' => 7500000,
        ]);

        $item3 = Item::firstOrCreate(['item_code' => 'MAT-WD-003'], [
            'item_name' => 'Welding Electrode E7018 - 3.2mm (20kg Box)',
            'unit' => 'Box',
            'category' => 'Consumable',
            'estimated_price' => 450000,
        ]);

        /*
        |--------------------------------------------------------------------------
        | PURCHASE REQUEST (SIMULATION)
        |--------------------------------------------------------------------------
        */

        $pr1 = PurchaseRequest::create([
            'pr_number' => 'PR-EPC-' . date('Ym') . '-0001',
            'project_id' => $project2->id, // Fabrikasi Pressure Vessel
            'department_id' => $manufacturingDept->id,
            'requested_by' => $projectUser->id,
            'request_date' => now()->subDays(7),
            'status' => 'approved',
            'notes' => 'Material requirement untuk fabrikasi Body Pressure Vessel (Pertamina)',
            'approved_by' => $approver->id,
            'approved_at' => now()->subDays(6),
        ]);

        PurchaseRequestDetail::create([
            'purchase_request_id' => $pr1->id,
            'item_id' => $item1->id,
            'qty' => 50,
            'estimated_price' => 3500000,
            'remarks' => 'Material spesifikasi harus sesuai sertifikat Mill',
        ]);

        PurchaseRequestDetail::create([
            'purchase_request_id' => $pr1->id,
            'item_id' => $item3->id,
            'qty' => 10,
            'estimated_price' => 450000,
            'remarks' => 'Untuk pengelasan dasar',
        ]);

        /*
        |--------------------------------------------------------------------------
        | APPROVAL LOGS (PR)
        |--------------------------------------------------------------------------
        */

        ApprovalLog::create([
            'reference_type' => 'purchase_request',
            'reference_id' => $pr1->id,
            'action' => 'submitted',
            'notes' => 'Tolong segera diproses untuk kejar target fabrikasi minggu ke-3',
            'acted_by' => $projectUser->id,
            'acted_at' => now()->subDays(7),
        ]);

        ApprovalLog::create([
            'reference_type' => 'purchase_request',
            'reference_id' => $pr1->id,
            'action' => 'approved',
            'notes' => 'Approved, pastikan vendor melampirkan sertifikat material',
            'acted_by' => $approver->id,
            'acted_at' => now()->subDays(6),
        ]);

        /*
        |--------------------------------------------------------------------------
        | VENDOR QUOTATION (SIMULATION)
        |--------------------------------------------------------------------------
        */

        $quotation1 = VendorQuotation::create([
            'purchase_request_id' => $pr1->id,
            'vendor_id' => $vendor1->id, // Krakatau Steel
            'quotation_number' => 'QT-EPC-' . date('Ym') . '-0001',
            'quotation_date' => now()->subDays(5),
            'total_amount' => 174500000,
            'status' => 'selected',
            'selected_at' => now()->subDays(4),
        ]);

        VendorQuotationDetail::create([
            'vendor_quotation_id' => $quotation1->id,
            'item_id' => $item1->id,
            'qty' => 50,
            'price' => 3400000, // Harga deal lebih murah dari estimasi
            'subtotal' => 170000000,
        ]);

        VendorQuotationDetail::create([
            'vendor_quotation_id' => $quotation1->id,
            'item_id' => $item3->id,
            'qty' => 10,
            'price' => 450000,
            'subtotal' => 4500000,
        ]);

        ApprovalLog::create([
            'reference_type' => 'vendor_quotation',
            'reference_id' => $quotation1->id,
            'action' => 'selected_vendor',
            'notes' => 'Harga KS masuk budget, delivery time sesuai schedule produksi',
            'acted_by' => $procurement->id,
            'acted_at' => now()->subDays(4),
        ]);

        /*
        |--------------------------------------------------------------------------
        | PURCHASE ORDER (SIMULATION)
        |--------------------------------------------------------------------------
        */

        $po1 = PurchaseOrder::create([
            'po_number' => 'PO-EPC-' . date('Ym') . '-0001',
            'purchase_request_id' => $pr1->id,
            'vendor_id' => $vendor1->id,
            'po_date' => now()->subDays(3),
            'total_amount' => 174500000,
            'status' => 'issued',
            'created_by' => $procurement->id,
        ]);

        PurchaseOrderDetail::create([
            'purchase_order_id' => $po1->id,
            'item_id' => $item1->id,
            'qty' => 50,
            'price' => 3400000,
            'subtotal' => 170000000,
        ]);

        PurchaseOrderDetail::create([
            'purchase_order_id' => $po1->id,
            'item_id' => $item3->id,
            'qty' => 10,
            'price' => 450000,
            'subtotal' => 4500000,
        ]);

        ApprovalLog::create([
            'reference_type' => 'purchase_order',
            'reference_id' => $po1->id,
            'action' => 'issued_po',
            'notes' => 'PO Released ke Krakatau Steel, expected delivery 2 minggu.',
            'acted_by' => $procurement->id,
            'acted_at' => now()->subDays(3),
        ]);

        /*
        |--------------------------------------------------------------------------
        | ADDITIONAL PURCHASE REQUESTS (DRAFT & SUBMITTED FOR TESTING)
        |--------------------------------------------------------------------------
        */

        // PR 2: Submitted (Waiting for Approval)
        $pr2 = PurchaseRequest::create([
            'pr_number' => 'PR-EPC-' . date('Ym') . '-0002',
            'project_id' => $project1->id, // PLTU Lontar
            'department_id' => $engineeringDept->id,
            'requested_by' => $projectUser->id,
            'request_date' => now()->subDays(2),
            'status' => 'submitted',
            'notes' => 'Permintaan pipa seamless untuk cooling water system',
            'approved_by' => null,
            'approved_at' => null,
        ]);

        PurchaseRequestDetail::create([
            'purchase_request_id' => $pr2->id,
            'item_id' => $item2->id, // Seamless Pipe
            'qty' => 120,
            'estimated_price' => 7500000,
            'remarks' => 'Panjang standard 6 meter per batang',
        ]);

        ApprovalLog::create([
            'reference_type' => 'purchase_request',
            'reference_id' => $pr2->id,
            'action' => 'submitted',
            'notes' => 'Harap segera di-review, material ini long-lead item',
            'acted_by' => $projectUser->id,
            'acted_at' => now()->subDays(2),
        ]);

        // PR 3: Draft (Waiting to be submitted)
        $pr3 = PurchaseRequest::create([
            'pr_number' => 'PR-EPC-' . date('Ym') . '-0003',
            'project_id' => $project1->id,
            'department_id' => $engineeringDept->id,
            'requested_by' => $projectUser->id,
            'request_date' => now(),
            'status' => 'draft',
            'notes' => 'Draft PR untuk kebutuhan material plate pondasi',
            'approved_by' => null,
            'approved_at' => null,
        ]);

        PurchaseRequestDetail::create([
            'purchase_request_id' => $pr3->id,
            'item_id' => $item1->id, // Steel Plate
            'qty' => 30,
            'estimated_price' => 3500000,
            'remarks' => 'Untuk base plate pompa',
        ]);
    }
}

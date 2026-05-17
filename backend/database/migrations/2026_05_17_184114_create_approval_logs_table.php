<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('approval_logs', function (Blueprint $table) {
            $table->id();
            $table->string('reference_type'); // purchase_request, vendor_quotation, purchase_order
            $table->unsignedBigInteger('reference_id');
            $table->string('action'); // submitted, approved, rejected, selected_vendor, issued_po, closed_po
            $table->text('notes')->nullable();
            $table->foreignId('acted_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('acted_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approval_logs');
    }
};

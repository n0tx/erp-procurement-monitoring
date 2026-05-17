<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorQuotation extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_request_id',
        'vendor_id',
        'quotation_number',
        'quotation_date',
        'total_amount',
        'status',
        'selected_at',
    ];

    protected $casts = [
        'quotation_date' => 'date',
        'selected_at' => 'datetime',
    ];

    public function purchaseRequest()
    {
        return $this->belongsTo(PurchaseRequest::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function details()
    {
        return $this->hasMany(VendorQuotationDetail::class);
    }
}

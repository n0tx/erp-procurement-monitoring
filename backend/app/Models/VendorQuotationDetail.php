<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorQuotationDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_quotation_id',
        'item_id',
        'qty',
        'price',
        'subtotal',
    ];

    public function vendorQuotation()
    {
        return $this->belongsTo(VendorQuotation::class);
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}

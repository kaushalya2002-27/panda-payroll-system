<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimecardProduct extends Model
{
    protected $fillable = [
        'timecard_id',
        'product_id',
        'quantity'
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(PayrollProduct::class, 'product_id');
    }
}

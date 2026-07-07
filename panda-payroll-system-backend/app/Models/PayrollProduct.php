<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayrollProduct extends Model
{
    use HasFactory;

    protected $table = 'payroll_products';


    protected $fillable = [
        'product_name',
        'target_weekday',
        'target_saturday',
        'rate_above',
        'rate_below',
        'sort_order',
        'status',
    ];
}

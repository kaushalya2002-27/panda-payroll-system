<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;


    protected $table = 'sa_cm_cmr_product_standards';


    protected $fillable = [
        'product_name',
        'product_code',
        'target_quantity',
        'rate'
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayrollJobPosition extends Model
{
    protected $table = 'job_positions';
    protected $fillable = ['name'];
}

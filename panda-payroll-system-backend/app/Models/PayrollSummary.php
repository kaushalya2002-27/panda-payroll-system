<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayrollSummary extends Model
{
    use HasFactory;

    protected $table = 'payroll_summaries';
    protected $fillable = [
        'employee_id',
        'payroll_year',
        'payroll_month',
        'days_worked',
        'days_leave',
        'total_production',
        'total_ot',
        'total_day_duty',
        'total_travelling',
        'total_other',
        'gross_pay',
        'is_locked'
    ];

    protected $casts = [
        'payroll_year'     => 'integer',
        'payroll_month'    => 'integer',
        'days_worked'      => 'integer',
        'days_leave'       => 'integer',
        'total_production' => 'float',
        'total_ot'         => 'float',
        'total_day_duty'   => 'float',
        'total_travelling' => 'float',
        'total_other'      => 'float',
        'gross_pay'        => 'float',
        'is_locked'        => 'boolean',
    ];


    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }
}

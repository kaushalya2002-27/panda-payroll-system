<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{

    protected $fillable = [
        'emp_code',
        'full_name',
        'nic',
        'gender',
        'date_of_birth',
        'join_date',
        'department_id',
        'designation',
        'phone',
        'email',
        'address',
        'bank_name',
        'bank_branch',
        'photo',
        'is_active'
    ];


    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function payrollSummaries()
    {
        return $this->hasMany(PayrollSummary::class, 'employee_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Timecard extends Model
{
    protected $fillable = [
        'employee_id',
        'work_date',
        'status',
        'start_time',
        'end_time',
        'hours',
        'ot_hours',
        'day_duty',
        'travelling',
        'other_allowance',
        'gross_pay',
        'notes'
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(TimecardProduct::class, 'timecard_id');
    }
}

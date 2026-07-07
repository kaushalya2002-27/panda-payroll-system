<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Employees Table
        if (!Schema::hasTable('employees')) {
            Schema::create('employees', function (Blueprint $table) {
                $table->id();
                $table->string('emp_code', 20)->unique();
                $table->string('full_name', 150);
                $table->string('nic', 20)->nullable();
                $table->enum('gender', ['Male', 'Female', 'Other'])->nullable();
                $table->date('date_of_birth')->nullable();
                $table->date('join_date')->nullable();


                $table->foreignId('department_id')->nullable()->constrained('com_departments')->onDelete('set null');

                $table->string('designation', 100)->nullable();
                $table->string('phone', 20)->nullable();
                $table->string('email', 100)->nullable();
                $table->text('address')->nullable();
                $table->string('bank_name', 100)->nullable();
                $table->string('bank_branch', 100)->nullable();
                $table->string('account_number', 50)->nullable();
                $table->string('emergency_name', 150)->nullable();
                $table->string('emergency_phone', 20)->nullable();
                $table->string('emergency_relation', 50)->nullable();
                $table->string('photo', 255)->nullable();
                $table->tinyInteger('is_active')->default(1);
                $table->timestamps();
            });
        }

        // 2. Timecards Table (Daily Attendance)
        if (!Schema::hasTable('timecards')) {
            Schema::create('timecards', function (Blueprint $table) {
                $table->id();
                $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
                $table->date('work_date');
                $table->enum('status', ['work', 'leave', 'holiday', 'off'])->default('work');
                $table->string('start_time', 10)->nullable();
                $table->string('end_time', 10)->nullable();
                $table->decimal('ot_hours', 5, 2)->default(0.00);
                $table->decimal('day_duty', 10, 2)->default(0.00);
                $table->decimal('travelling', 10, 2)->default(0.00);
                $table->decimal('other_allowance', 10, 2)->default(0.00);
                $table->timestamps();

                $table->unique(['employee_id', 'work_date']);
            });
        }

        // 3. Timecard Products Table (Daily Production Quantity)
        if (!Schema::hasTable('timecard_products')) {
            Schema::create('timecard_products', function (Blueprint $table) {
                $table->id();
                $table->foreignId('timecard_id')->constrained('timecards')->onDelete('cascade');


                $table->foreignId('product_id')->constrained('sa_cm_cmr_product_standards')->onDelete('restrict');

                $table->integer('quantity')->default(0);
                $table->timestamps();

                $table->unique(['timecard_id', 'product_id']);
            });
        }

        // 4. Payroll Summaries Table (Monthly Pay Total)
        if (!Schema::hasTable('payroll_summaries')) {
            Schema::create('payroll_summaries', function (Blueprint $table) {
                $table->id();
                $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
                $table->integer('payroll_year');
                $table->integer('payroll_month');
                $table->integer('days_worked')->default(0);
                $table->integer('days_leave')->default(0);
                $table->decimal('total_production', 12, 2)->default(0.00);
                $table->decimal('total_ot', 12, 2)->default(0.00);
                $table->decimal('total_day_duty', 12, 2)->default(0.00);
                $table->decimal('total_travelling', 12, 2)->default(0.00);
                $table->decimal('total_other', 12, 2)->default(0.00);
                $table->decimal('gross_pay', 12, 2)->default(0.00);
                $table->tinyInteger('is_locked')->default(0);
                $table->timestamps();

                $table->unique(['employee_id', 'payroll_year', 'payroll_month'], 'emp_monthly_payroll_unique');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_summaries');
        Schema::dropIfExists('timecard_products');
        Schema::dropIfExists('timecards');
        Schema::dropIfExists('employees');
    }
};

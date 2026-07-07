<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('employees', function (Blueprint $table) {
        $table->id();
        $table->string('emp_code')->unique();
        $table->string('full_name');
        $table->string('nic');
        $table->string('gender');
        $table->date('date_of_birth');
        $table->date('join_date');
        $table->unsignedBigInteger('department_id');
        $table->string('designation');
        $table->string('phone');
        $table->string('email')->nullable();
        $table->text('address');
        $table->string('bank_name')->nullable();
        $table->string('bank_branch')->nullable();
        $table->string('account_number')->nullable();
        $table->string('emergency_name')->nullable();
        $table->string('emergency_phone')->nullable();
        $table->string('emergency_relation')->nullable();
        $table->boolean('is_active')->default(1);
        $table->string('photo')->nullable();
        $table->timestamps();


        $table->foreign('department_id')->references('id')->on('departments')->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};

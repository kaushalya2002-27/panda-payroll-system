<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('timecards', function (Blueprint $table) {
            $table->decimal('gross_pay', 10, 2)->default(0.00)->after('other_allowance');
            $table->text('notes')->nullable()->after('gross_pay');
        });
    }

    public function down(): void
    {
        Schema::table('timecards', function (Blueprint $table) {
            $table->dropColumn(['gross_pay', 'notes']);
        });
    }
};

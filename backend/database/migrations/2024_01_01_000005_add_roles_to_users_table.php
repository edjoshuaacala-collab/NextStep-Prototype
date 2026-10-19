<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // student | faculty | partner
            $table->string('role', 20)->default('student')->after('id')->index();
            // active | pending (partner accounts wait for approval)
            $table->string('account_status', 20)->default('active')->after('role');

            // Only students have a student number now.
            $table->string('student_number')->nullable()->change();

            // Faculty fields
            $table->string('employee_id', 30)->nullable()->unique()->after('student_number');
            $table->string('position', 60)->nullable()->after('employee_id');
            $table->string('department', 120)->nullable()->after('position');

            // External partner fields
            $table->string('company_name', 150)->nullable()->after('department');
            $table->string('job_title', 100)->nullable()->after('company_name');
            $table->string('contact_number', 20)->nullable()->after('job_title');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['employee_id']);
            $table->dropIndex(['role']);
            $table->dropColumn([
                'role', 'account_status', 'employee_id', 'position', 'department',
                'company_name', 'job_title', 'contact_number',
            ]);
        });
    }
};

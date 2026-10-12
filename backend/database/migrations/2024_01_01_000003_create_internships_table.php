<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('internships', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('company');
            $table->string('role_category');
            $table->string('location');
            $table->string('work_setup')->default('Onsite');
            $table->text('description');
            $table->text('skills');
            $table->unsignedSmallInteger('slots')->default(1);
            $table->string('duration')->default('300 hours');
            $table->string('allowance')->nullable();
            $table->date('deadline')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internships');
    }
};

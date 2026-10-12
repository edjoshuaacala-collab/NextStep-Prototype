<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('student_number')->unique();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('program')->default('Not specified');
            $table->unsignedTinyInteger('year_level')->default(1);
            $table->text('skills')->nullable();
            $table->unsignedTinyInteger('profile_completeness')->default(40);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

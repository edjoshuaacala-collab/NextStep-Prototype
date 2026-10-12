<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('internship_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('Pending'); // Pending, Under review, Endorsed
            $table->text('cover_note')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'internship_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};

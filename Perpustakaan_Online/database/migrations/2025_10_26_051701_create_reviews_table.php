<?php

/**
 * FILE: database/migrations/2024_01_01_000003_create_reviews_table.php
 * FOLDER: database/migrations/
 *
 * Cara membuat:
 * php artisan make:migration create_reviews_table
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('book_id')->constrained()->onDelete('cascade');
            $table->decimal('rating', 2, 1); // rating 0.0 - 5.0
            $table->text('comment')->nullable();
            $table->timestamps();

            // Prevent duplicate review: 1 user = 1 review per book
            $table->unique(['user_id', 'book_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};

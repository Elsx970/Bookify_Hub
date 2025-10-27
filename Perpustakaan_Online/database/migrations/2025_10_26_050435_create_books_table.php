<?php

/**
 * FILE: database/migrations/2024_01_01_000001_create_books_table.php
 * FOLDER: database/migrations/
 *
 * Cara membuat:
 * php artisan make:migration create_books_table
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
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('author');
            $table->year('publication_year');
            $table->string('genre');
            $table->text('description');
            $table->decimal('rating', 3, 2)->default(0.00); // rating 0.00 - 5.00
            $table->string('cover_image')->nullable();
            $table->integer('review_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};

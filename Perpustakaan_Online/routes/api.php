<?php

/**
 * FILE: routes/api.php
 * LOKASI: routes/api.php
 *
 * BUAT FILE BARU INI DI FOLDER routes/
 */

use App\Http\Controllers\BookController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\ReviewController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes - tidak perlu login
Route::prefix('books')->group(function () {
    Route::get('/', [BookController::class, 'index']); // List all books
    Route::get('/genres', [BookController::class, 'genres']); // Get all genres
    Route::get('/{id}', [BookController::class, 'show']); // Get book detail
    Route::get('/{id}/recommendations', [BookController::class, 'recommendations']); // Get similar books

    // Public: Get reviews for a book
    Route::get('/{bookId}/reviews', [ReviewController::class, 'index']);
});

// Public stats - tidak perlu login
Route::get('/stats', [BookController::class, 'publicStats']);

// Protected routes - harus login
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Review routes (User must be logged in)
    Route::prefix('books/{bookId}/reviews')->group(function () {
        Route::post('/', [ReviewController::class, 'store']); // Create review
        Route::get('/my-review', [ReviewController::class, 'getUserReview']); // Get user's review
        Route::put('/{reviewId}', [ReviewController::class, 'update']); // Update own review
        Route::delete('/{reviewId}', [ReviewController::class, 'destroy']); // Delete own review
    });

    // User's all reviews
    Route::get('/my-reviews', [ReviewController::class, 'myReviews']);

    // Favorite routes (User must be logged in)
    Route::prefix('favorites')->group(function () {
        Route::get('/', [FavoriteController::class, 'index']); // Get user's favorites
        Route::post('/statistics', [FavoriteController::class, 'statistics']); // Get favorite statistics
        Route::post('/{bookId}/toggle', [FavoriteController::class, 'toggle']); // Toggle favorite
        Route::get('/{bookId}/check', [FavoriteController::class, 'check']); // Check if favorited
        Route::delete('/{bookId}', [FavoriteController::class, 'destroy']); // Remove from favorites
    });

    // Admin only routes
    Route::middleware('admin')->group(function () {
        // Admin Dashboard
        Route::get('/admin/dashboard', [App\Http\Controllers\AdminController::class, 'dashboard']);

        // Book management
        Route::prefix('admin/books')->group(function () {
            Route::post('/', [BookController::class, 'store']);
            Route::post('/{id}', [BookController::class, 'update']); // POST untuk FormData
            Route::put('/{id}', [BookController::class, 'update']); // PUT standard
            Route::delete('/{id}', [BookController::class, 'destroy']);
            Route::get('/statistics', [BookController::class, 'statistics']);
        });

        // Review management (Admin)
        Route::prefix('admin/reviews')->group(function () {
            Route::get('/', [ReviewController::class, 'adminIndex']); // List all reviews
            Route::delete('/{reviewId}', [ReviewController::class, 'adminDestroy']); // Delete any review
        });

        // Favorite statistics (Admin)
        Route::prefix('admin/favorites')->group(function () {
            Route::get('/statistics', [FavoriteController::class, 'adminStatistics']); // Get all favorite statistics
        });

        // Google Books integration (Admin)
        Route::prefix('admin/google-books')->group(function () {
            Route::get('/search', [App\Http\Controllers\GoogleBooksController::class, 'search']); // Search Google Books
            Route::post('/download-cover', [App\Http\Controllers\GoogleBooksController::class, 'downloadCover']); // Download cover image
        });
    });
});

<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Static Pages
Route::get('/about', function () {
    return Inertia::render('about');
})->name('about');

Route::get('/contact', function () {
    return Inertia::render('contact');
})->name('contact');

Route::get('/privacy', function () {
    return Inertia::render('privacy');
})->name('privacy');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        // Auto-redirect admin to admin dashboard
        if (auth()->user()->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }
        return Inertia::render('dashboard');
    })->name('dashboard');

    // TEST ROUTE - untuk verify UserLayout
    Route::get('/test-dashboard', function () {
        return Inertia::render('test-dashboard');
    })->name('test.dashboard');

    // NAVBAR TEST - Simple page to verify navbar
    Route::get('/navbar-test', function () {
        return Inertia::render('navbar-test');
    })->name('navbar.test');

    // Books routes
    Route::get('/books', function () {
        return Inertia::render('books/index');
    })->name('books.index');

    Route::get('/books/{id}', function ($id) {
        return Inertia::render('books/show', ['id' => $id]);
    })->name('books.show');

    // Favorites
    Route::get('/favorites', function () {
        return Inertia::render('books/favorites');
    })->name('favorites');

    // My Reviews
    Route::get('/my-reviews', function () {
        return Inertia::render('books/my-reviews');
    })->name('my-reviews');

    // User Profile Dashboard
    Route::get('/profile/dashboard', function () {
        return Inertia::render('profile/dashboard');
    })->name('profile.dashboard');

    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('admin/dashboard');
        })->name('admin.dashboard');

        Route::get('/books', function () {
            return Inertia::render('admin/books/index');
        })->name('admin.books.index');

        Route::get('/books/create', function () {
            return Inertia::render('admin/books/create');
        })->name('admin.books.create');

        Route::get('/books/{id}/edit', function ($id) {
            return Inertia::render('admin/books/edit', ['bookId' => $id]);
        })->name('admin.books.edit');

        Route::get('/analytics', function () {
            return Inertia::render('admin/analytics');
        })->name('admin.analytics');

        Route::get('/reviews', function () {
            return Inertia::render('admin/reviews');
        })->name('admin.reviews');
    });
});

require __DIR__.'/settings.php';

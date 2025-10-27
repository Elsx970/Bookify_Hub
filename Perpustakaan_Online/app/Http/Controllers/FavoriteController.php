<?php

/**
 * FILE: app/Http/Controllers/FavoriteController.php
 * FOLDER: app/Http/Controllers/
 *
 * Cara membuat:
 * php artisan make:controller FavoriteController
 */

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    /**
     * Get all favorite books of current user
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = $user->favoriteBooks()
            ->withCount('reviews')
            ->orderBy('favorites.created_at', 'desc');

        // Filter by genre
        if ($request->has('genre')) {
            $query->where('genre', $request->genre);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('author', 'LIKE', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 12);
        $favorites = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'total' => $favorites->total(),
            'favorites' => $favorites,
        ]);
    }

    /**
     * Add book to favorites (Toggle - if exists remove, if not add)
     */
    public function toggle($bookId)
    {
        // Check if book exists
        $book = Book::findOrFail($bookId);

        $userId = Auth::id();

        // Check if already favorited
        $favorite = Favorite::where('user_id', $userId)
            ->where('book_id', $bookId)
            ->first();

        if ($favorite) {
            // Remove from favorites
            $favorite->delete();

            return response()->json([
                'success' => true,
                'message' => 'Book removed from favorites',
                'is_favorited' => false,
            ]);
        } else {
            // Add to favorites
            Favorite::create([
                'user_id' => $userId,
                'book_id' => $bookId,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Book added to favorites',
                'is_favorited' => true,
            ], 201);
        }
    }

    /**
     * Check if book is favorited by current user
     */
    public function check($bookId)
    {
        $isFavorited = Favorite::where('user_id', Auth::id())
            ->where('book_id', $bookId)
            ->exists();

        return response()->json([
            'success' => true,
            'is_favorited' => $isFavorited,
        ]);
    }

    /**
     * Remove book from favorites
     */
    public function destroy($bookId)
    {
        $favorite = Favorite::where('user_id', Auth::id())
            ->where('book_id', $bookId)
            ->first();

        if (! $favorite) {
            return response()->json([
                'success' => false,
                'message' => 'Book not found in favorites',
            ], 404);
        }

        $favorite->delete();

        return response()->json([
            'success' => true,
            'message' => 'Book removed from favorites',
        ]);
    }

    /**
     * Get favorite statistics for current user
     */
    public function statistics()
    {
        $user = Auth::user();

        $stats = [
            'total_favorites' => $user->favorites()->count(),
            'favorite_genres' => $user->favoriteBooks()
                ->selectRaw('genre, COUNT(*) as count')
                ->groupBy('genre')
                ->orderBy('count', 'desc')
                ->get(),
            'recently_added' => $user->favoriteBooks()
                ->orderBy('favorites.created_at', 'desc')
                ->limit(5)
                ->get(),
            'top_rated_favorites' => $user->favoriteBooks()
                ->orderBy('rating', 'desc')
                ->limit(5)
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'statistics' => $stats,
        ]);
    }

    /**
     * Admin: Get all favorites with statistics
     */
    public function adminStatistics()
    {
        $stats = [
            'total_favorites' => Favorite::count(),
            'most_favorited_books' => Book::withCount('favorites')
                ->orderBy('favorites_count', 'desc')
                ->limit(10)
                ->get(),
            'users_with_most_favorites' => Favorite::selectRaw('user_id, COUNT(*) as count')
                ->groupBy('user_id')
                ->orderBy('count', 'desc')
                ->with('user:id,name,email')
                ->limit(10)
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'statistics' => $stats,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Favorite;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get comprehensive dashboard statistics
     */
    public function dashboard(Request $request)
    {
        // Overall stats - Match frontend structure
        $totalStats = [
            'books' => Book::count(),
            'users' => User::where('role', 'user')->count(),
            'reviews' => Review::count(),
            'favorites' => Favorite::count(),
        ];

        // Genre popularity (top 10)
        $genreStats = Book::select('genre', DB::raw('count(*) as count'))
            ->groupBy('genre')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        // Top rated books (top 10)
        $topRatedBooks = Book::orderBy('rating', 'desc')
            ->orderBy('review_count', 'desc')
            ->limit(10)
            ->get(['id', 'title', 'author', 'rating', 'review_count']);

        // Most reviewed books (top 10)
        $mostReviewedBooks = Book::orderBy('review_count', 'desc')
            ->limit(10)
            ->get(['id', 'title', 'author', 'rating', 'review_count']);

        // Most favorited books (top 10)
        $mostFavoritedBooks = Book::withCount('favorites')
            ->orderBy('favorites_count', 'desc')
            ->limit(10)
            ->get(['id', 'title', 'author', 'rating']);

        // Recent activity
        $recentReviews = Review::with(['user', 'book'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Books by publication year
        $booksByYear = Book::select(DB::raw('publication_year, count(*) as count'))
            ->groupBy('publication_year')
            ->orderBy('publication_year', 'desc')
            ->limit(10)
            ->get();

        // Rating distribution
        $ratingDistribution = Review::select(DB::raw('FLOOR(rating) as rating_floor, count(*) as count'))
            ->groupBy('rating_floor')
            ->orderBy('rating_floor')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->rating_floor => $item->count];
            });

        // Active users (users with most reviews)
        $activeUsers = User::withCount('reviews')
            ->where('role', 'user')
            ->orderBy('reviews_count', 'desc')
            ->limit(10)
            ->get(['id', 'name', 'email']);

        // Recent activity - Books added over last 30 days
        $recentActivity = Book::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as books_added')
        )
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => date('M d', strtotime($item->date)),
                    'books_added' => $item->books_added,
                ];
            });

        return response()->json([
            'totalStats' => $totalStats,
            'genreDistribution' => $genreStats, // Renamed for clarity
            'topRatedBooks' => $topRatedBooks,
            'mostReviewedBooks' => $mostReviewedBooks,
            'mostFavoritedBooks' => $mostFavoritedBooks,
            'recentReviews' => $recentReviews,
            'booksByYear' => $booksByYear,
            'ratingDistribution' => $ratingDistribution,
            'activeUsers' => $activeUsers,
            'recentActivity' => $recentActivity,
        ]);
    }
}

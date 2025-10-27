<?php

/**
 * FILE: app/Http/Controllers/ReviewController.php
 * FOLDER: app/Http/Controllers/
 *
 * Cara membuat:
 * php artisan make:controller ReviewController
 */

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Get all reviews for a specific book
     */
    public function index($bookId)
    {
        $book = Book::findOrFail($bookId);

        $reviews = Review::where('book_id', $bookId)
            ->with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'book' => [
                'id' => $book->id,
                'title' => $book->title,
                'rating' => $book->rating,
                'review_count' => $book->review_count,
            ],
            'reviews' => $reviews,
        ]);
    }

    /**
     * Store a new review (User must be logged in)
     */
    public function store(Request $request, $bookId)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|numeric|min:0.5|max:5.0',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check if book exists
        $book = Book::findOrFail($bookId);

        // Check if user already reviewed this book
        $existingReview = Review::where('user_id', Auth::id())
            ->where('book_id', $bookId)
            ->first();

        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'You have already reviewed this book. Please update your existing review.',
            ], 409);
        }

        // Create review
        $review = Review::create([
            'user_id' => Auth::id(),
            'book_id' => $bookId,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        $review->load('user:id,name,email');

        return response()->json([
            'success' => true,
            'message' => 'Review added successfully',
            'review' => $review,
        ], 201);
    }

    /**
     * Update user's own review
     */
    public function update(Request $request, $bookId, $reviewId)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'sometimes|required|numeric|min:0.5|max:5.0',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $review = Review::where('id', $reviewId)
            ->where('book_id', $bookId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $review->update($request->only(['rating', 'comment']));
        $review->load('user:id,name,email');

        return response()->json([
            'success' => true,
            'message' => 'Review updated successfully',
            'review' => $review,
        ]);
    }

    /**
     * Delete user's own review
     */
    public function destroy($bookId, $reviewId)
    {
        $review = Review::where('id', $reviewId)
            ->where('book_id', $bookId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully',
        ]);
    }

    /**
     * Get user's review for a specific book
     */
    public function getUserReview($bookId)
    {
        $review = Review::where('book_id', $bookId)
            ->where('user_id', Auth::id())
            ->with('user:id,name,email')
            ->first();

        if (! $review) {
            return response()->json([
                'success' => false,
                'message' => 'No review found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'review' => $review,
        ]);
    }

    /**
     * Get all reviews by current user
     */
    public function myReviews()
    {
        $reviews = Review::where('user_id', Auth::id())
            ->with('book:id,title,author,genre,cover_image,rating')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'reviews' => $reviews,
        ]);
    }

    /**
     * Admin: Delete any review
     */
    public function adminDestroy($reviewId)
    {
        $review = Review::findOrFail($reviewId);
        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully by admin',
        ]);
    }

    /**
     * Admin: Get all reviews with filters
     */
    public function adminIndex(Request $request)
    {
        $query = Review::with(['user:id,name,email', 'book:id,title,author,cover_image']);

        // Search by book title, author, or user name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('book', function ($bookQuery) use ($search) {
                    $bookQuery->where('title', 'ILIKE', "%{$search}%")
                        ->orWhere('author', 'ILIKE', "%{$search}%");
                })->orWhereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'ILIKE', "%{$search}%")
                        ->orWhere('email', 'ILIKE', "%{$search}%");
                });
            });
        }

        // Filter by book
        if ($request->has('book_id')) {
            $query->where('book_id', $request->book_id);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by exact rating
        if ($request->has('rating')) {
            $query->where('rating', $request->rating);
        }

        // Filter by minimum rating
        if ($request->has('min_rating')) {
            $query->where('rating', '>=', $request->min_rating);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Return all reviews (no pagination for admin view)
        $reviews = $query->get();

        return response()->json($reviews);
    }
}

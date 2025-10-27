<?php

/**
 * FILE: app/Http/Controllers/BookController.php
 * FOLDER: app/Http/Controllers/
 *
 * Cara membuat:
 * php artisan make:controller BookController
 */

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class BookController extends Controller
{
    /**
     * Display a listing of books with filters, search, and sorting
     */
    public function index(Request $request)
    {
        $query = Book::query()->with('reviews');

        // Search by title or author (case-insensitive)
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%")
                    ->orWhere('author', 'ILIKE', "%{$search}%");
            });
        }

        // Filter by genre
        if ($request->has('genre')) {
            $query->where('genre', $request->genre);
        }

        // Filter by rating (minimum rating)
        if ($request->has('min_rating')) {
            $query->where('rating', '>=', $request->min_rating);
        }

        // Filter by publication year
        if ($request->has('year')) {
            $query->where('publication_year', $request->year);
        }

        // Sorting - support both old and new format
        $sort = $request->get('sort', $request->get('sort_by', 'newest'));

        switch ($sort) {
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'title_asc':
            case 'title':
                $query->orderBy('title', 'asc');
                break;
            case 'title_desc':
                $query->orderBy('title', 'desc');
                break;
            case 'rating_high':
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            case 'rating_low':
                $query->orderBy('rating', 'asc');
                break;
            case 'popular':
                $query->orderBy('review_count', 'desc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        // Pagination - default show all (or large number)
        // Set per_page = 0 or 'all' to get all books without pagination
        $perPage = $request->get('per_page', 1000); // Default 1000 (practically all books)

        if ($perPage === 'all' || $perPage == 0) {
            // Return all books without pagination
            $books = $query->get();

            return response()->json([
                'data' => $books,
                'total' => $books->count(),
            ]);
        }

        $books = $query->paginate($perPage);

        return response()->json($books);
    }

    /**
     * Get all unique genres
     */
    public function genres()
    {
        $genres = Book::distinct()->pluck('genre');

        return response()->json($genres);
    }

    /**
     * Display the specified book
     */
    public function show($id)
    {
        $book = Book::with(['reviews.user', 'reviews' => function ($q) {
            $q->latest()->limit(5);
        }])->findOrFail($id);

        // Get similar books (same genre, different book)
        $similarBooks = Book::where('genre', $book->genre)
            ->where('id', '!=', $book->id)
            ->orderBy('rating', 'desc')
            ->limit(6)
            ->get();

        return response()->json([
            'book' => $book,
            'similar_books' => $similarBooks,
        ]);
    }

    /**
     * Get similar book recommendations based on genre
     */
    public function recommendations($id)
    {
        $currentBook = Book::findOrFail($id);

        // Smart recommendation algorithm:
        // 1. Same genre (highest priority)
        // 2. Similar rating range (±0.5)
        // 3. Popular books (high review count)
        // 4. Exclude current book

        $recommendations = Book::where('id', '!=', $id)
            ->where(function ($query) use ($currentBook) {
                // Priority 1: Same genre
                $query->where('genre', $currentBook->genre)
                    ->orWhere(function ($q) use ($currentBook) {
                        // Priority 2: Similar rating
                        $q->whereBetween('rating', [
                            max(0, $currentBook->rating - 0.5),
                            min(5, $currentBook->rating + 0.5),
                        ]);
                    });
            })
            ->orderByRaw('
                CASE 
                    WHEN genre = ? THEN 1 
                    ELSE 2 
                END, 
                ABS(rating - ?) ASC,
                review_count DESC
            ', [$currentBook->genre, $currentBook->rating])
            ->limit(12)
            ->get();

        return response()->json([
            'recommendations' => $recommendations,
            'based_on' => [
                'genre' => $currentBook->genre,
                'rating' => $currentBook->rating,
            ],
        ]);
    }

    /**
     * Store a newly created book (Admin only)
     */
    public function store(Request $request)
    {
        \Log::info('📥 Book store request received', [
            'method' => $request->method(),
            'has_file' => $request->hasFile('cover_image'),
            'all_keys' => array_keys($request->all()),
            'file_keys' => array_keys($request->allFiles()),
        ]);

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'publication_year' => 'required|integer|min:1000|max:'.date('Y'),
            'genre' => 'required|string|max:100',
            'description' => 'required|string',
            'rating' => 'nullable|numeric|min:0|max:5',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120', // 5MB
            'google_books_cover' => 'nullable|string', // Filename from Google Books download
        ]);

        if ($validator->fails()) {
            \Log::error('❌ Validation failed', ['errors' => $validator->errors()]);

            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $bookData = $request->only([
            'title', 'author', 'publication_year',
            'genre', 'description', 'rating',
        ]);

        // Handle cover image - either uploaded or from Google Books
        if ($request->has('google_books_cover')) {
            // Use cover already downloaded from Google Books
            $bookData['cover_image'] = $request->input('google_books_cover');
            \Log::info('📚 Using Google Books cover', ['filename' => $bookData['cover_image']]);
        } elseif ($request->hasFile('cover_image')) {
            \Log::info('✅ Processing cover image upload');
            $image = $request->file('cover_image');
            \Log::info('📎 File details', [
                'original_name' => $image->getClientOriginalName(),
                'mime' => $image->getMimeType(),
                'size_kb' => round($image->getSize() / 1024, 2),
                'size_bytes' => $image->getSize(),
            ]);

            // Create safe filename
            $imageName = time().'_'.preg_replace('/[^A-Za-z0-9\-_.]/', '_', $image->getClientOriginalName());

            \Log::info('💾 Attempting to store file (CREATE)', [
                'target_path' => 'covers',
                'filename' => $imageName,
            ]);

            // METHOD 1: Try using Storage facade with explicit disk
            $targetPath = 'covers/'.$imageName;
            $stored = Storage::disk('public')->put($targetPath, file_get_contents($image->getRealPath()));

            \Log::info('📥 Storage::put() returned', ['result' => $stored, 'path' => $targetPath]);

            // CRITICAL: Verify file actually exists
            $fullPath = storage_path('app'.DIRECTORY_SEPARATOR.'public'.DIRECTORY_SEPARATOR.'covers'.DIRECTORY_SEPARATOR.$imageName);
            $fileExists = file_exists($fullPath);

            \Log::info('🔍 File existence check', [
                'full_path' => $fullPath,
                'exists' => $fileExists,
                'filesize' => $fileExists ? filesize($fullPath) : 0,
                'directory_exists' => is_dir(dirname($fullPath)),
                'directory_writable' => is_writable(dirname($fullPath)),
            ]);

            if (! $fileExists) {
                \Log::error('❌ FILE NOT SAVED! Storage::put() returned '.$stored.' but file does not exist!');

                // METHOD 2: Try direct file move as fallback
                \Log::info('🔄 Trying fallback: direct file move...');
                $moved = $image->move(storage_path('app'.DIRECTORY_SEPARATOR.'public'.DIRECTORY_SEPARATOR.'covers'), $imageName);
                \Log::info('📦 move() result', ['moved' => $moved !== false, 'path' => $moved]);

                // Check again
                $fileExists = file_exists($fullPath);
                \Log::info('🔍 After move() - file exists:', ['exists' => $fileExists]);
            }

            $bookData['cover_image'] = 'covers/'.$imageName;
        } else {
            \Log::warning('⚠️ No cover_image file in request', [
                'content_type' => $request->header('Content-Type'),
            ]);
        }

        $book = Book::create($bookData);

        \Log::info('✅ Book created successfully', ['book_id' => $book->id, 'cover_image' => $book->cover_image]);

        return response()->json([
            'success' => true,
            'message' => 'Book created successfully',
            'book' => $book,
        ], 201);
    }

    /**
     * Update the specified book (Admin only)
     */
    public function update(Request $request, $id)
    {
        $book = Book::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'author' => 'sometimes|required|string|max:255',
            'publication_year' => 'sometimes|required|integer|min:1000|max:'.date('Y'),
            'genre' => 'sometimes|required|string|max:100',
            'description' => 'sometimes|required|string',
            'rating' => 'nullable|numeric|min:0|max:5',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120', // 5MB
            'google_books_cover' => 'nullable|string', // Filename from Google Books download
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $bookData = $request->only([
            'title', 'author', 'publication_year',
            'genre', 'description', 'rating',
        ]);

        // Handle new cover image - either uploaded or from Google Books
        if ($request->has('google_books_cover')) {
            // Use cover already downloaded from Google Books
            // Delete old image first
            if ($book->cover_image) {
                \Log::info('🗑️ Deleting old image: '.$book->cover_image);
                Storage::delete('public/'.$book->cover_image);
            }
            $bookData['cover_image'] = $request->input('google_books_cover');
            \Log::info('📚 Using Google Books cover for update', ['filename' => $bookData['cover_image']]);
        } elseif ($request->hasFile('cover_image')) {
            \Log::info('✅ Processing cover image update for book '.$id);

            // Delete old image
            if ($book->cover_image) {
                \Log::info('🗑️ Deleting old image: '.$book->cover_image);
                Storage::delete('public/'.$book->cover_image);
            }

            $image = $request->file('cover_image');
            \Log::info('📎 New file details', [
                'original_name' => $image->getClientOriginalName(),
                'mime' => $image->getMimeType(),
                'size_kb' => round($image->getSize() / 1024, 2),
                'size_bytes' => $image->getSize(),
                'is_valid' => $image->isValid(),
            ]);

            // Create safe filename
            $imageName = time().'_'.preg_replace('/[^A-Za-z0-9\-_.]/', '_', $image->getClientOriginalName());

            \Log::info('💾 Attempting to store file', [
                'target_path' => 'covers',
                'filename' => $imageName,
            ]);

            // METHOD 1: Try using Storage facade with explicit disk
            $targetPath = 'covers/'.$imageName;
            $stored = Storage::disk('public')->put($targetPath, file_get_contents($image->getRealPath()));

            \Log::info('📥 Storage::put() returned', ['result' => $stored, 'path' => $targetPath]);

            // CRITICAL: Verify file actually exists
            $fullPath = storage_path('app'.DIRECTORY_SEPARATOR.'public'.DIRECTORY_SEPARATOR.'covers'.DIRECTORY_SEPARATOR.$imageName);
            $fileExists = file_exists($fullPath);

            \Log::info('🔍 File existence check', [
                'full_path' => $fullPath,
                'exists' => $fileExists,
                'filesize' => $fileExists ? filesize($fullPath) : 0,
                'directory_exists' => is_dir(dirname($fullPath)),
                'directory_writable' => is_writable(dirname($fullPath)),
            ]);

            if (! $fileExists) {
                \Log::error('❌ FILE NOT SAVED! Storage::put() returned '.$stored.' but file does not exist!');

                // METHOD 2: Try direct file move as fallback
                \Log::info('🔄 Trying fallback: direct file move...');
                $moved = $image->move(storage_path('app'.DIRECTORY_SEPARATOR.'public'.DIRECTORY_SEPARATOR.'covers'), $imageName);
                \Log::info('📦 move() result', ['moved' => $moved !== false, 'path' => $moved]);

                // Check again
                $fileExists = file_exists($fullPath);
                \Log::info('🔍 After move() - file exists:', ['exists' => $fileExists]);
            }

            $bookData['cover_image'] = 'covers/'.$imageName;
        } else {
            \Log::warning('⚠️ No cover_image file in update request for book '.$id);
        }

        $book->update($bookData);

        return response()->json([
            'success' => true,
            'message' => 'Book updated successfully',
            'book' => $book,
        ]);
    }

    /**
     * Remove the specified book (Admin only)
     */
    public function destroy($id)
    {
        $book = Book::findOrFail($id);

        // Delete cover image
        if ($book->cover_image) {
            Storage::delete('public/'.$book->cover_image);
        }

        // Delete associated reviews and favorites
        $book->reviews()->delete();
        $book->favorites()->delete();

        $book->delete();

        return response()->json([
            'success' => true,
            'message' => 'Book deleted successfully',
        ]);
    }

    /**
     * Get book statistics (for admin dashboard)
     */
    public function statistics()
    {
        $stats = [
            'total_books' => Book::count(),
            'total_reviews' => Book::sum('review_count'),
            'average_rating' => round(Book::avg('rating'), 2),
            'top_rated_books' => Book::orderBy('rating', 'desc')->limit(5)->get(),
            'most_reviewed_books' => Book::orderBy('review_count', 'desc')->limit(5)->get(),
            'genre_distribution' => Book::selectRaw('genre, COUNT(*) as count')
                ->groupBy('genre')
                ->orderBy('count', 'desc')
                ->get(),
            'books_by_year' => Book::selectRaw('publication_year, COUNT(*) as count')
                ->groupBy('publication_year')
                ->orderBy('publication_year', 'desc')
                ->limit(10)
                ->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Get public statistics (for landing page, no auth required)
     */
    public function publicStats()
    {
        $stats = [
            'books' => Book::count(),
            'users' => \App\Models\User::where('role', 'user')->count(),
            'reviews' => \App\Models\Review::count(),
        ];

        return response()->json($stats);
    }
}

<?php

namespace App\Http\Controllers;

use App\Services\GoogleBooksService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GoogleBooksController extends Controller
{
    public function __construct(
        private GoogleBooksService $googleBooksService
    ) {}

    /**
     * Search books from Google Books API
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|min:2',
            'max_results' => 'integer|min:1|max:40',
        ]);

        $query = $request->input('query');
        $maxResults = $request->input('max_results', 10);

        $results = $this->googleBooksService->searchBooks($query, $maxResults);

        return response()->json([
            'success' => true,
            'count' => count($results),
            'results' => $results,
        ]);
    }

    /**
     * Download cover image from Google Books URL and save to storage
     */
    public function downloadCover(Request $request): JsonResponse
    {
        $request->validate([
            'url' => 'required|url',
        ]);

        $url = $request->input('url');

        $filename = $this->googleBooksService->downloadCoverImage($url);

        if (! $filename) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to download cover image',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'filename' => $filename,
            'url' => asset('storage/'.$filename),
        ]);
    }
}

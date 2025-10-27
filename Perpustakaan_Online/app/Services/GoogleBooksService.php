<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleBooksService
{
    private const API_URL = 'https://www.googleapis.com/books/v1/volumes';

    /**
     * Search books from Google Books API
     */
    public function searchBooks(string $query, int $maxResults = 10): array
    {
        try {
            $response = Http::timeout(10)->get(self::API_URL, [
                'q' => $query,
                'maxResults' => $maxResults,
                'printType' => 'books',
                'langRestrict' => 'en', // You can remove this to search all languages
            ]);

            if (! $response->successful()) {
                Log::error('Google Books API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return [];
            }

            $data = $response->json();

            return $this->formatSearchResults($data);
        } catch (\Exception $e) {
            Log::error('Google Books API exception', [
                'message' => $e->getMessage(),
            ]);

            return [];
        }
    }

    /**
     * Format search results to a consistent structure
     */
    private function formatSearchResults(array $data): array
    {
        if (! isset($data['items']) || ! is_array($data['items'])) {
            return [];
        }

        return array_map(function ($item) {
            $volumeInfo = $item['volumeInfo'] ?? [];
            $imageLinks = $volumeInfo['imageLinks'] ?? [];

            return [
                'google_id' => $item['id'] ?? null,
                'title' => $volumeInfo['title'] ?? 'Unknown Title',
                'author' => $this->formatAuthors($volumeInfo['authors'] ?? []),
                'description' => $volumeInfo['description'] ?? '',
                'published_year' => $this->extractYear($volumeInfo['publishedDate'] ?? ''),
                'genre' => $this->extractGenre($volumeInfo['categories'] ?? []),
                'cover_image_url' => $this->getBestCoverImage($imageLinks),
                'thumbnail' => $imageLinks['thumbnail'] ?? null,
                'page_count' => $volumeInfo['pageCount'] ?? null,
                'publisher' => $volumeInfo['publisher'] ?? null,
                'language' => $volumeInfo['language'] ?? 'en',
            ];
        }, $data['items']);
    }

    /**
     * Format authors array to comma-separated string
     */
    private function formatAuthors(array $authors): string
    {
        if (empty($authors)) {
            return 'Unknown Author';
        }

        return implode(', ', array_slice($authors, 0, 3)); // Max 3 authors
    }

    /**
     * Extract year from published date (format: YYYY-MM-DD or YYYY)
     */
    private function extractYear(string $publishedDate): ?int
    {
        if (empty($publishedDate)) {
            return null;
        }

        // Try to extract 4-digit year
        if (preg_match('/(\d{4})/', $publishedDate, $matches)) {
            return (int) $matches[1];
        }

        return null;
    }

    /**
     * Extract first genre from categories
     */
    private function extractGenre(array $categories): string
    {
        if (empty($categories)) {
            return 'General';
        }

        // Google Books categories can be like "Fiction / Fantasy"
        $genre = $categories[0];

        // Take the first part if there's a slash
        if (str_contains($genre, '/')) {
            $parts = explode('/', $genre);
            $genre = trim($parts[0]);
        }

        return $genre;
    }

    /**
     * Get the best quality cover image available
     * Priority: extraLarge > large > medium > small > thumbnail
     */
    private function getBestCoverImage(array $imageLinks): ?string
    {
        $priority = ['extraLarge', 'large', 'medium', 'small', 'thumbnail', 'smallThumbnail'];

        foreach ($priority as $size) {
            if (isset($imageLinks[$size])) {
                // Replace http with https for security
                return str_replace('http://', 'https://', $imageLinks[$size]);
            }
        }

        return null;
    }

    /**
     * Download cover image from URL and save to storage
     */
    public function downloadCoverImage(string $url): ?string
    {
        try {
            $response = Http::timeout(30)->get($url);

            if (! $response->successful()) {
                Log::error('Failed to download cover image', ['url' => $url]);

                return null;
            }

            // Generate unique filename
            $extension = pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'jpg';
            $filename = 'covers/'.uniqid('google_book_', true).'.'.$extension;

            // Save to storage
            \Storage::disk('public')->put($filename, $response->body());

            return $filename;
        } catch (\Exception $e) {
            Log::error('Error downloading cover image', [
                'url' => $url,
                'message' => $e->getMessage(),
            ]);

            return null;
        }
    }
}

<?php

namespace App\Console\Commands;

use App\Models\Book;
use App\Services\GoogleBooksService;
use Illuminate\Console\Command;

class ImportGoogleBooks extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'books:import-google
                            {--count=50 : Number of books to import}
                            {--query= : Specific search query}';

    /**
     * The console command description.
     */
    protected $description = 'Import books from Google Books API into the database';

    /**
     * Execute the console command.
     */
    public function handle(GoogleBooksService $googleBooksService): int
    {
        $count = (int) $this->option('count');
        $query = $this->option('query');

        $this->info('🚀 Starting Google Books import...');
        $this->newLine();

        // Popular search queries for diverse books
        $searchQueries = [
            'bestseller fiction',
            'classic literature',
            'science fiction',
            'fantasy novels',
            'mystery thriller',
            'romance novels',
            'biography',
            'history books',
            'self help',
            'business books',
            'technology programming',
            'philosophy',
            'psychology',
            'young adult',
            'children books',
            'horror books',
            'adventure novels',
            'poetry',
            'drama plays',
            'crime novels',
            'political books',
            'art books',
            'cooking books',
            'travel books',
            'sports books',
        ];

        // If specific query provided, use only that
        if ($query) {
            $searchQueries = [$query];
        }

        $importedCount = 0;
        $skippedCount = 0;
        $targetCount = $count;

        $progressBar = $this->output->createProgressBar($targetCount);
        $progressBar->start();

        foreach ($searchQueries as $searchQuery) {
            if ($importedCount >= $targetCount) {
                break;
            }

            // Search Google Books (request 15 per query to get more options)
            $results = $googleBooksService->searchBooks($searchQuery, 15);

            foreach ($results as $bookData) {
                if ($importedCount >= $targetCount) {
                    break;
                }

                // Skip books without cover images
                if (empty($bookData['cover_image_url'])) {
                    $skippedCount++;
                    continue;
                }

                // Check if book already exists
                $exists = Book::where('title', $bookData['title'])
                    ->where('author', $bookData['author'])
                    ->exists();

                if ($exists) {
                    $skippedCount++;

                    continue;
                }

                // Download cover image
                $coverImage = $googleBooksService->downloadCoverImage($bookData['cover_image_url']);
                
                // Skip if cover download failed
                if (!$coverImage) {
                    $skippedCount++;
                    continue;
                }

                // Create book
                try {
                    Book::create([
                        'title' => $bookData['title'],
                        'author' => $bookData['author'],
                        'publication_year' => $bookData['published_year'] ?? date('Y'),
                        'genre' => $bookData['genre'] ?? 'General',
                        'description' => $bookData['description'] ?? 'No description available.',
                        'cover_image' => $coverImage,
                        'rating' => 0,
                        'review_count' => 0,
                    ]);

                    $importedCount++;
                    $progressBar->advance();
                } catch (\Exception $e) {
                    $this->error("\n❌ Failed to import: {$bookData['title']} - {$e->getMessage()}");
                    $skippedCount++;
                    continue;
                }
            }

            // Small delay to respect API rate limits
            usleep(500000); // 0.5 seconds
        }

        $progressBar->finish();
        $this->newLine(2);

        // Summary
        $this->info('✅ Import completed!');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Books Imported', $importedCount],
                ['Books Skipped (duplicates)', $skippedCount],
                ['Total Processed', $importedCount + $skippedCount],
            ]
        );

        if ($importedCount > 0) {
            $this->newLine();
            $this->info('🎉 Successfully imported books from Google Books!');
            $this->info('📚 You can now view them in the application.');
        } else {
            $this->warn('⚠️  No new books were imported. They may already exist in the database.');
        }

        return self::SUCCESS;
    }
}

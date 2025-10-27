<?php

namespace Database\Factories;

use App\Models\Book;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Book>
 */
class BookFactory extends Factory
{
    protected $model = Book::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $genres = [
            'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery',
            'Thriller', 'Romance', 'Horror', 'Biography', 'History',
            'Self-Help', 'Business', 'Science', 'Technology', 'Poetry',
            'Drama', 'Adventure', 'Young Adult', 'Children', 'Classic',
        ];

        return [
            'title' => $this->faker->sentence(rand(2, 5)),
            'author' => $this->faker->name(),
            'publication_year' => $this->faker->numberBetween(1950, date('Y')),
            'genre' => $this->faker->randomElement($genres),
            'description' => $this->faker->paragraph(rand(3, 7)),
            'rating' => $this->faker->randomFloat(2, 0, 5),
            'review_count' => $this->faker->numberBetween(0, 100),
            'cover_image' => null, // Will be set manually if needed
        ];
    }
}

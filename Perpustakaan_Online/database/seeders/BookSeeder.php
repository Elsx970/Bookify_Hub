<?php

namespace Database\Seeders;

use App\Models\Book;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Famous books with real data
        $famousBooks = [
            [
                'title' => 'To Kill a Mockingbird',
                'author' => 'Harper Lee',
                'publication_year' => 1960,
                'genre' => 'Fiction',
                'description' => 'A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice.',
                'rating' => 4.8,
                'review_count' => 0,
            ],
            [
                'title' => '1984',
                'author' => 'George Orwell',
                'publication_year' => 1949,
                'genre' => 'Science Fiction',
                'description' => 'A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.',
                'rating' => 4.7,
                'review_count' => 0,
            ],
            [
                'title' => 'Pride and Prejudice',
                'author' => 'Jane Austen',
                'publication_year' => 1813,
                'genre' => 'Romance',
                'description' => 'A romantic novel of manners that chronicles the emotional development of Elizabeth Bennet.',
                'rating' => 4.6,
                'review_count' => 0,
            ],
            [
                'title' => 'The Great Gatsby',
                'author' => 'F. Scott Fitzgerald',
                'publication_year' => 1925,
                'genre' => 'Fiction',
                'description' => 'A tragic love story set in the Jazz Age, exploring themes of decadence and excess.',
                'rating' => 4.5,
                'review_count' => 0,
            ],
            [
                'title' => 'Harry Potter and the Philosopher\'s Stone',
                'author' => 'J.K. Rowling',
                'publication_year' => 1997,
                'genre' => 'Fantasy',
                'description' => 'A young wizard\'s journey begins at Hogwarts School of Witchcraft and Wizardry.',
                'rating' => 4.9,
                'review_count' => 0,
            ],
            [
                'title' => 'The Hobbit',
                'author' => 'J.R.R. Tolkien',
                'publication_year' => 1937,
                'genre' => 'Fantasy',
                'description' => 'A fantasy novel about the quest of Bilbo Baggins, a hobbit, to win a share of treasure.',
                'rating' => 4.7,
                'review_count' => 0,
            ],
            [
                'title' => 'The Catcher in the Rye',
                'author' => 'J.D. Salinger',
                'publication_year' => 1951,
                'genre' => 'Fiction',
                'description' => 'A story about teenage rebellion and alienation narrated by Holden Caulfield.',
                'rating' => 4.3,
                'review_count' => 0,
            ],
            [
                'title' => 'Brave New World',
                'author' => 'Aldous Huxley',
                'publication_year' => 1932,
                'genre' => 'Science Fiction',
                'description' => 'A dystopian novel set in a futuristic World State of genetically modified citizens.',
                'rating' => 4.4,
                'review_count' => 0,
            ],
            [
                'title' => 'The Lord of the Rings',
                'author' => 'J.R.R. Tolkien',
                'publication_year' => 1954,
                'genre' => 'Fantasy',
                'description' => 'An epic high-fantasy novel about the quest to destroy the One Ring.',
                'rating' => 4.9,
                'review_count' => 0,
            ],
            [
                'title' => 'Jane Eyre',
                'author' => 'Charlotte Brontë',
                'publication_year' => 1847,
                'genre' => 'Romance',
                'description' => 'A coming-of-age story following the emotions and experiences of Jane Eyre.',
                'rating' => 4.5,
                'review_count' => 0,
            ],
            [
                'title' => 'The Chronicles of Narnia',
                'author' => 'C.S. Lewis',
                'publication_year' => 1950,
                'genre' => 'Fantasy',
                'description' => 'A series of fantasy novels about the adventures in the magical land of Narnia.',
                'rating' => 4.6,
                'review_count' => 0,
            ],
            [
                'title' => 'Moby-Dick',
                'author' => 'Herman Melville',
                'publication_year' => 1851,
                'genre' => 'Adventure',
                'description' => 'The narrative of Captain Ahab\'s obsessive quest to take revenge on Moby Dick.',
                'rating' => 4.2,
                'review_count' => 0,
            ],
            [
                'title' => 'Wuthering Heights',
                'author' => 'Emily Brontë',
                'publication_year' => 1847,
                'genre' => 'Romance',
                'description' => 'A tale of passion and revenge set on the Yorkshire moors.',
                'rating' => 4.4,
                'review_count' => 0,
            ],
            [
                'title' => 'The Alchemist',
                'author' => 'Paulo Coelho',
                'publication_year' => 1988,
                'genre' => 'Fiction',
                'description' => 'A philosophical novel about a young shepherd\'s journey to find treasure in Egypt.',
                'rating' => 4.6,
                'review_count' => 0,
            ],
            [
                'title' => 'Frankenstein',
                'author' => 'Mary Shelley',
                'publication_year' => 1818,
                'genre' => 'Horror',
                'description' => 'A Gothic novel about a scientist who creates a sapient creature.',
                'rating' => 4.3,
                'review_count' => 0,
            ],
            [
                'title' => 'Crime and Punishment',
                'author' => 'Fyodor Dostoevsky',
                'publication_year' => 1866,
                'genre' => 'Fiction',
                'description' => 'A psychological novel about a poor student who commits murder.',
                'rating' => 4.7,
                'review_count' => 0,
            ],
            [
                'title' => 'The Odyssey',
                'author' => 'Homer',
                'publication_year' => -800,
                'genre' => 'Classic',
                'description' => 'An ancient Greek epic poem following Odysseus\'s journey home after the Trojan War.',
                'rating' => 4.5,
                'review_count' => 0,
            ],
            [
                'title' => 'Dracula',
                'author' => 'Bram Stoker',
                'publication_year' => 1897,
                'genre' => 'Horror',
                'description' => 'A Gothic horror novel introducing the famous vampire Count Dracula.',
                'rating' => 4.4,
                'review_count' => 0,
            ],
            [
                'title' => 'The Little Prince',
                'author' => 'Antoine de Saint-Exupéry',
                'publication_year' => 1943,
                'genre' => 'Children',
                'description' => 'A novella about a young prince who visits various planets in space.',
                'rating' => 4.8,
                'review_count' => 0,
            ],
            [
                'title' => 'Animal Farm',
                'author' => 'George Orwell',
                'publication_year' => 1945,
                'genre' => 'Fiction',
                'description' => 'An allegorical novella reflecting events leading up to the Russian Revolution.',
                'rating' => 4.6,
                'review_count' => 0,
            ],
        ];

        // Insert famous books
        foreach ($famousBooks as $book) {
            Book::create($book);
        }

        // Generate additional random books using factory
        Book::factory(30)->create();

        $this->command->info('Successfully seeded 50 books (20 famous + 30 random)');
    }
}

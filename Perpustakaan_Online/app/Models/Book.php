<?php

/**
 * FILE: app/Models/Book.php
 * FOLDER: app/Models/
 *
 * Cara membuat:
 * php artisan make:model Book
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'author',
        'publication_year',
        'genre',
        'description',
        'rating',
        'cover_image',
        'review_count',
    ];

    /**
     * Get the casts for model attributes.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'publication_year' => 'integer',
            'rating' => 'decimal:2',
            'review_count' => 'integer',
        ];
    }

    /**
     * Relationship: Book has many Reviews
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Relationship: Book has many Favorites
     */
    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    /**
     * Check if book is favorited by user
     */
    public function isFavoritedBy($userId)
    {
        return $this->favorites()->where('user_id', $userId)->exists();
    }

    /**
     * Update book rating based on reviews
     */
    public function updateRating()
    {
        $avgRating = $this->reviews()->avg('rating');
        $this->rating = $avgRating ? round($avgRating, 2) : 0.00;
        $this->review_count = $this->reviews()->count();
        $this->save();
    }
}

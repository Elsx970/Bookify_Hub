<?php

/**
 * FILE: app/Models/Review.php
 * FOLDER: app/Models/
 *
 * Cara membuat:
 * php artisan make:model Review
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'book_id',
        'rating',
        'comment',
    ];

    /**
     * Get the casts for model attributes.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rating' => 'decimal:1',
        ];
    }

    /**
     * Relationship: Review belongs to User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship: Review belongs to Book
     */
    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    /**
     * Boot method - Update book rating when review is saved/deleted
     */
    protected static function boot()
    {
        parent::boot();

        static::saved(function ($review) {
            $review->book->updateRating();
        });

        static::deleted(function ($review) {
            $review->book->updateRating();
        });
    }
}

<?php

/**
 * FILE: app/Models/Favorite.php
 * FOLDER: app/Models/
 *
 * Cara membuat:
 * php artisan make:model Favorite
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'book_id',
    ];

    /**
     * Relationship: Favorite belongs to User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship: Favorite belongs to Book
     */
    public function book()
    {
        return $this->belongsTo(Book::class);
    }
}

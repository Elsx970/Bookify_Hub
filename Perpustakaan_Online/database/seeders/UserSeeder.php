<?php

/**
 * FILE: database/seeders/UserSeeder.php
 * FOLDER: database/seeders/
 *
 * Cara membuat:
 * php artisan make:seeder UserSeeder
 *
 * Cara menjalankan:
 * php artisan db:seed --class=UserSeeder
 */

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin Account
        User::create([
            'name' => 'Admin Bookify',
            'email' => 'admin@bookify.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'email_verified_at' => now(), // Langsung verified
        ]);

        // Create Regular User Account
        User::create([
            'name' => 'User Demo',
            'email' => 'user@bookify.com',
            'password' => Hash::make('user123'),
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        echo "✅ Admin & User created successfully!\n";
        echo "-----------------------------------\n";
        echo "Admin Login:\n";
        echo "Email: admin@bookify.com\n";
        echo "Password: admin123\n";
        echo "-----------------------------------\n";
        echo "User Login:\n";
        echo "Email: user@bookify.com\n";
        echo "Password: user123\n";
    }
}

<?php

/**
 * FILE: app/Http/Middleware/AdminMiddleware.php
 * FOLDER: app/Http/Middleware/
 *
 * Cara membuat:
 * php artisan make:middleware AdminMiddleware
 */

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Cek apakah user sudah login
        if (! auth()->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Please login first.',
            ], 401);
        }

        // Cek apakah user adalah admin (asumsi ada field 'role' di tabel users)
        if (auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Admin access only.',
            ], 403);
        }

        return $next($request);
    }
}

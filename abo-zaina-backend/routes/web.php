<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SitemapController;

Route::get('/', function () {
    return view('welcome');
});

// Sitemap route
Route::get('/sitemap.xml', [SitemapController::class, 'index']);

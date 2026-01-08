<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

DB::listen(function($query) {
    echo "SQL: " . $query->sql . " [" . implode(', ', $query->bindings) . "]\n";
});

try {
    $controller = new App\Http\Controllers\Api\SitemapController();
    $response = $controller->index();
    echo "Sitemap generated successfully!\n";
} catch (\Exception $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n";
    echo "FILE: " . $e->getFile() . " LINE: " . $e->getLine() . "\n";
    // echo $e->getTraceAsString();
}

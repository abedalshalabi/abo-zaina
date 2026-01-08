<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

DB::enableQueryLog();

try {
    $controller = new App\Http\Controllers\Api\SitemapController();
    $response = $controller->index();
    echo "Sitemap generated successfully!\n";
} catch (\Exception $e) {
    echo "FAILED: " . $e->getMessage() . "\n";
}

$queries = DB::getQueryLog();
foreach ($queries as $q) {
    echo "SQL: " . $q['query'] . " | Bindings: " . implode(', ', $q['bindings']) . "\n";
}

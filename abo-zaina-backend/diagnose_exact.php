<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Product;
use Illuminate\Support\Facades\DB;

echo "Running exact product query...\n";

try {
    $products = Product::where('is_active', true)
        ->select('id', 'name', 'images', 'image', 'updated_at', 'is_active')
        ->get();
    echo "Product query OK, count: " . count($products) . "\n";
} catch (\Exception $e) {
    echo "Product query FAILED: " . $e->getMessage() . "\n";
}

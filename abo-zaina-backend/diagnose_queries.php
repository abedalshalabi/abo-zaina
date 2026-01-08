<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Offer;

echo "Starting diagnosis...\n";

try {
    $count = Product::where('is_active', true)->count();
    echo "Product: OK ($count)\n";
} catch (\Exception $e) {
    echo "Product: FAILED - " . $e->getMessage() . "\n";
}

try {
    $count = Category::where('is_active', true)->count();
    echo "Category: OK ($count)\n";
} catch (\Exception $e) {
    echo "Category: FAILED - " . $e->getMessage() . "\n";
}

try {
    $count = Brand::where('is_active', true)->count();
    echo "Brand: OK ($count)\n";
} catch (\Exception $e) {
    echo "Brand: FAILED - " . $e->getMessage() . "\n";
}

try {
    $count = Offer::where('is_active', true)->count();
    echo "Offer: OK ($count)\n";
} catch (\Exception $e) {
    echo "Offer: FAILED - " . $e->getMessage() . "\n";
}
echo "Diagnosis finished.\n";

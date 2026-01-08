<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$models = [
    'Product' => App\Models\Product::class,
    'Category' => App\Models\Category::class,
    'Brand' => App\Models\Brand::class,
    'Offer' => App\Models\Offer::class
];

foreach ($models as $name => $class) {
    try {
        echo "Checking $name...\n";
        $count = $class::where('is_active', true)->count();
        echo "  $name is OK, count: $count\n";
    } catch (\Exception $e) {
        echo "  $name FAILED: " . $e->getMessage() . "\n";
    }
}

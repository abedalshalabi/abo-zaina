<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    $count = App\Models\Category::where('is_active', 1)->count();
    echo "Count: $count\n";
    
    $cat = App\Models\Category::where('is_active', 1)->first();
    if ($cat) {
        echo "Found one: " . $cat->name . " (is_active: " . ($cat->is_active ? 'true' : 'false') . ")\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

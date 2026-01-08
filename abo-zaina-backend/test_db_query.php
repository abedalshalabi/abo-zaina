<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    $row = DB::table('products')->where('is_active', 1)->first();
    echo "DB::table OK, found: " . ($row ? $row->name : 'nothing') . "\n";
} catch (\Exception $e) {
    echo "DB::table FAILED: " . $e->getMessage() . "\n";
}

try {
    $row = \App\Models\Product::where('is_active', 1)->first();
    echo "Eloquent OK, found: " . ($row ? $row->name : 'nothing') . "\n";
} catch (\Exception $e) {
    echo "Eloquent FAILED: " . $e->getMessage() . "\n";
}

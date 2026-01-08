<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$categories = App\Models\Category::where('is_active', true)
    ->get(['id', 'name', 'parent_id']);

foreach ($categories as $cat) {
    echo $cat->id . "|" . $cat->name . "|" . ($cat->parent_id ?? 'None') . "\n";
}

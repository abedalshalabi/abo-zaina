<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$categories = App\Models\Category::whereNull('parent_id')
    ->where('is_active', true)
    ->get(['id', 'name']);

foreach ($categories as $cat) {
    echo $cat->id . "|" . $cat->name . "\n";
}

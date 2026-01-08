<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Database: " . DB::getDatabaseName() . "\n";

$tables = DB::select('SHOW TABLES');
echo "Tables:\n";
foreach ($tables as $table) {
    print_r($table);
}

echo "\nDescribe products:\n";
$cols = DB::select('DESC products');
print_r($cols);

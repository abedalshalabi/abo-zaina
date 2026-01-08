<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$res = DB::select('SHOW CREATE TABLE products');
$sql = $res[0]->{'Create Table'};
$lines = explode("\n", $sql);
foreach ($lines as $line) {
    if (strpos($line, 'is_active') !== false) {
        echo "LINE: " . trim($line) . "\n";
        // Check for hidden characters
        if (preg_match('/`([^`]+)`/', $line, $matches)) {
            $colName = $matches[1];
            echo "HEX: " . bin2hex($colName) . " for [$colName]\n";
        }
    }
}

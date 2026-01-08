<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$controller = new App\Http\Controllers\Api\SitemapController();
$response = $controller->index();
$xml = $response->getContent();

file_put_contents('sitemap_verify.xml', $xml);
echo "Sitemap generated and saved to sitemap_verify.xml\n";

echo "First 1000 chars:\n";
echo substr($xml, 0, 1000) . "\n...\n";

echo "Searching for home-appliances:\n";
if (strpos($xml, '/home-appliances') !== false) {
    echo "Found /home-appliances!\n";
} else {
    echo "NOT found /home-appliances\n";
}

echo "Searching for kitchen (أجهزة المطبخ الصغيرة):\n";
if (strpos($xml, '/kitchen') !== false) {
    echo "Found /kitchen!\n";
} else {
    echo "NOT found /kitchen\n";
}

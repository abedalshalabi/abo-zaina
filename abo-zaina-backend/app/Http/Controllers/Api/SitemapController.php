<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Offer;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class SitemapController extends Controller
{
    /**
     * Generate and return sitemap.xml
     */
    public function index(): Response
    {
        // Cache sitemap for 24 hours
        $sitemap = Cache::remember('sitemap_xml', 60 * 24, function () {
            return $this->generateSitemap();
        });

        return response($sitemap, 200)
            ->header('Content-Type', 'application/xml');
    }

    /**
     * Generate sitemap XML content
     */
    private function generateSitemap(): string
    {
        $siteUrl = config('app.url');
        if (!$siteUrl || str_contains($siteUrl, 'localhost')) {
            $siteUrl = 'https://abozaina.ps';
        }
        
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . "\n";
        $xml .= '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' . "\n";
        $xml .= '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9' . "\n";
        $xml .= '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">' . "\n\n";

        // Homepage
        $xml .= $this->addUrl($siteUrl . '/', '1.0', 'daily', now()->toDateString());

        // Products Page
        $xml .= $this->addUrl($siteUrl . '/products', '0.9', 'daily', now()->toDateString());

        // Categories Page
        $xml .= $this->addUrl($siteUrl . '/categories', '0.8', 'weekly', now()->toDateString());

        // Brands Page
        $xml .= $this->addUrl($siteUrl . '/brands', '0.8', 'weekly', now()->toDateString());

        // Offers Page
        $xml .= $this->addUrl($siteUrl . '/offers', '0.8', 'daily', now()->toDateString());

        // Static Pages
        $staticPages = [
            ['url' => '/about', 'priority' => '0.6', 'changefreq' => 'monthly'],
            ['url' => '/contact', 'priority' => '0.6', 'changefreq' => 'monthly'],
            ['url' => '/shipping', 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['url' => '/returns', 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['url' => '/warranty', 'priority' => '0.5', 'changefreq' => 'monthly'],
        ];

        foreach ($staticPages as $page) {
            $xml .= $this->addUrl($siteUrl . $page['url'], $page['priority'], $page['changefreq'], now()->toDateString());
        }

        // Active Products
        $products = Product::where('is_active', true)
            ->select('id', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->get();

        foreach ($products as $product) {
            $lastmod = $product->updated_at ? $product->updated_at->toDateString() : now()->toDateString();
            $xml .= $this->addUrl($siteUrl . '/product/' . $product->id, '0.7', 'weekly', $lastmod);
        }

        // Active Categories
        $categories = Category::where('is_active', true)
            ->select('id', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->get();

        foreach ($categories as $category) {
            $lastmod = $category->updated_at ? $category->updated_at->toDateString() : now()->toDateString();
            $xml .= $this->addUrl($siteUrl . '/products?category_id=' . $category->id, '0.7', 'weekly', $lastmod);
        }

        // Active Brands
        $brands = Brand::where('is_active', true)
            ->select('id', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->get();

        foreach ($brands as $brand) {
            $lastmod = $brand->updated_at ? $brand->updated_at->toDateString() : now()->toDateString();
            $xml .= $this->addUrl($siteUrl . '/products?brand_id=' . $brand->id, '0.7', 'weekly', $lastmod);
        }

        // Active Offers
        $offers = Offer::where('is_active', true)
            ->where('ends_at', '>', now())
            ->select('id', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->get();

        foreach ($offers as $offer) {
            $lastmod = $offer->updated_at ? $offer->updated_at->toDateString() : now()->toDateString();
            $xml .= $this->addUrl($siteUrl . '/offers', '0.8', 'daily', $lastmod);
        }

        $xml .= '</urlset>';

        return $xml;
    }

    /**
     * Add a URL entry to sitemap
     */
    private function addUrl(string $loc, string $priority, string $changefreq, string $lastmod): string
    {
        $xml = "  <url>\n";
        $xml .= "    <loc>" . htmlspecialchars($loc, ENT_XML1, 'UTF-8') . "</loc>\n";
        $xml .= "    <lastmod>" . $lastmod . "</lastmod>\n";
        $xml .= "    <changefreq>" . $changefreq . "</changefreq>\n";
        $xml .= "    <priority>" . $priority . "</priority>\n";
        $xml .= "  </url>\n\n";
        
        return $xml;
    }
}


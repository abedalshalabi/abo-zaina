<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class City extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'name_en',
        'shipping_cost',
        'delivery_time_days',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'shipping_cost' => 'decimal:2',
        'delivery_time_days' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}

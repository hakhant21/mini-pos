<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Product::class);

        return Inertia::render('operations/Index', [
            'section' => 'inventory',
            'title' => 'Inventory',
            'description' => 'Monitor stock levels and valuation across every selling unit.',
            'products' => Product::with(['category', 'stock', 'units'])->where('active', true)->latest()->paginate(20),
        ]);
    }
}

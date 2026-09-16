<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Product::class);

        return Inertia::render('operations/Index', [
            'section' => 'inventory',
            'title' => 'Inventory',
            'description' => 'Monitor stock levels and valuation across every selling unit.',
            'products' => Product::with(['category', 'units.stock'])
                ->where('active', true)
                ->when($request->integer('category_id') > 0, fn ($query) => $query->where('category_id', $request->integer('category_id')))
                ->latest()
                ->paginate(20)
                ->withQueryString(),
            'categoryOptions' => Category::query()->where('active', true)->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only('category_id'),
        ]);
    }
}

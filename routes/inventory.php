<?php

use App\Http\Controllers\Inventory\StockController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('inventory', [StockController::class, 'index'])->name('inventory.index');
    Route::get('inventory/create', [StockController::class, 'create'])->name('inventory.create');
    Route::post('inventory/stock', [StockController::class, 'store'])->name('inventory.store');
    Route::get('inventory/search-products', [StockController::class, 'searchProducts'])->name('inventory.search-products');
});

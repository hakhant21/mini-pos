<?php

use App\Http\Controllers\Products\ProductController;
use App\Http\Controllers\Products\ProductVariantController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('products', [ProductController::class, 'index'])->name('products.index');
    Route::get('products/create', [ProductController::class, 'create'])->name('products.create');
    Route::post('products', [ProductController::class, 'store'])->name('products.store');
    Route::get('products/{product}', [ProductController::class, 'show'])->name('products.show');
    Route::get('products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::patch('products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    Route::patch('products/{product}/toggle-active', [ProductController::class, 'toggleActive'])->name('products.toggle-active');
    Route::patch('products/{id}/restore', [ProductController::class, 'restore'])->name('products.restore');

    Route::post('products/{product}/variants', [ProductVariantController::class, 'store'])->name('variants.store');
    Route::patch('products/{product}/variants/{variant}', [ProductVariantController::class, 'update'])->name('variants.update');
    Route::patch('products/{product}/variants/{variant}/stock-price', [ProductVariantController::class, 'updateStockPrice'])->name('variants.update-stock-price');
    Route::delete('products/{product}/variants/{variant}', [ProductVariantController::class, 'destroy'])->name('variants.destroy');

    Route::get('stock-price-update', [ProductController::class, 'stockPriceUpdate'])->name('products.stock-price-update');
});

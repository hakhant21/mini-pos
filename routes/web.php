<?php

use App\Http\Controllers\Balances\BalanceController;
use App\Http\Controllers\Categories\CategoryController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Inventory\InventoryController;
use App\Http\Controllers\Products\ProductController;
use App\Http\Controllers\Purchases\PurchaseController;
use App\Http\Controllers\Reports\ReportController;
use App\Http\Controllers\Sales\SaleController;
use App\Http\Controllers\StockAdjustments\StockAdjustmentController;
use App\Http\Controllers\Suppliers\SupplierController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::post('balances', [BalanceController::class, 'store'])->name('balances.store');
    Route::resource('products', ProductController::class);
    Route::patch('products/{product}/quick-update', [ProductController::class, 'quickUpdate'])->name('products.quick-update');
    Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('suppliers', SupplierController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::resource('purchases', PurchaseController::class)->only(['index', 'create', 'store', 'show']);
    Route::resource('sales', SaleController::class)->only(['index', 'create', 'store', 'show']);
    Route::get('sales/{sale}/receipt', [SaleController::class, 'receipt'])->name('sales.receipt');
    Route::post('sales/{sale}/cancel', [SaleController::class, 'cancel'])->name('sales.cancel');
    Route::resource('adjustments', StockAdjustmentController::class)->only(['index', 'create', 'store', 'show']);
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('checkout', [SaleController::class, 'create'])->name('checkout.index');
});

require __DIR__.'/settings.php';

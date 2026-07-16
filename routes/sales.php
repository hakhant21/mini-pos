<?php

use App\Http\Controllers\Sales\SaleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('sales', [SaleController::class, 'index'])->name('sales.index');
    Route::get('sales/checkout', [SaleController::class, 'checkoutPage'])->name('sales.checkout-page');
    Route::post('sales/checkout', [SaleController::class, 'checkout'])->name('sales.checkout');
    Route::post('sales/{sale}/add-items', [SaleController::class, 'addItems'])->name('sales.add-items');
});

<?php

use App\Http\Controllers\Sales\SaleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('sales', [SaleController::class, 'index'])->name('sales.index');
    Route::post('sales/checkout', [SaleController::class, 'checkout'])->name('sales.checkout');
});

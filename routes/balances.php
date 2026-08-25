<?php

use App\Http\Controllers\Balances\BalanceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('balances', [BalanceController::class, 'index'])->name('balances.index');
    Route::post('balances', [BalanceController::class, 'store'])->name('balances.store');
    Route::patch('balances/{balance}', [BalanceController::class, 'update'])->name('balances.update');
    Route::delete('balances/{balance}', [BalanceController::class, 'destroy'])->name('balances.destroy');
});

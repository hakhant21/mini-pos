<?php

use App\Http\Controllers\Reports\ProfitLossController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('reports/profit-loss', [ProfitLossController::class, 'index'])->name('reports.profit-loss');
});

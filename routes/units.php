<?php

use App\Http\Controllers\Units\UnitController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('units', [UnitController::class, 'index'])->name('units.index');
    Route::post('units', [UnitController::class, 'store'])->name('units.store');
    Route::patch('units/{unit}', [UnitController::class, 'update'])->name('units.update');
    Route::delete('units/{unit}', [UnitController::class, 'destroy'])->name('units.destroy');
});

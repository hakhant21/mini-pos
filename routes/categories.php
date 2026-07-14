<?php

use App\Http\Controllers\Categories\CategoryController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::patch('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
    Route::patch('categories/{category}/toggle-active', [CategoryController::class, 'toggleActive'])->name('categories.toggle-active');
    Route::patch('categories/{id}/restore', [CategoryController::class, 'restore'])->name('categories.restore');
});

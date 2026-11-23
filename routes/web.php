<?php

use App\Http\Controllers\MealPlanController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('meal-plans', [MealPlanController::class, 'index'])->name('meal-plans.index');
    Route::post('meal-plans', [MealPlanController::class, 'store'])->name('meal-plans.store');
    Route::delete('meal-plans/{mealPlan}', [MealPlanController::class, 'destroy'])->name('meal-plans.destroy');
});

require __DIR__.'/settings.php';

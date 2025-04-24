<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\IssueController;

Route::get('/', function () {
    if (Auth::check()) {
        return Inertia::render('dashboard');
    }
    return Inertia::render('auth/login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::resource('users', UserController::class);
    Route::resource('logs', LogController::class);
    Route::resource('issues', IssueController::class);
    Route::resource('reports', ResourceController::class);
});

Route::get('/reports/monthly', [ReportController::class, 'monthly'])
    ->name('reports.monthly');
Route::get('/reports/monthly', [ReportController::class, 'apiMonthly']);

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
